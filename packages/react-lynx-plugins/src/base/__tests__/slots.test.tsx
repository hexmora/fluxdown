import type { Element } from 'hast';

import { cleanup, render, waitFor } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import type { FallbackProps, ParagraphProps, WrapperProps } from '../slot';

import { EmphasisSlotPlugin } from '../../plugins/emphasis';
import { HeadingSlotPlugin } from '../../plugins/heading';
import { StrongSlotPlugin } from '../../plugins/strong';
import { BaseSlotPlugin, createTypeOfSlot, SlotProvider } from '../slot';
import { resolveTheme, ThemeProvider } from '../theme';
import { LIGHT_THEME } from '../theme/presets/light';

afterEach(cleanup);

const node: Element = { type: 'element', tagName: 'p', properties: {}, children: [] };

const nodeProps = { current: node, parents: [], render: () => null };

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

const Heading = /*#__PURE__*/ createTypeOfSlot('Heading');

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

const Emphasis = /*#__PURE__*/ createTypeOfSlot('Emphasis');

class Original extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'original';

  readonly type = 'Paragraph';

  readonly Component = ({ children }: ParagraphProps) => <text>original:{children}</text>;
}

class Decorated extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'decorated';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...props }: ParagraphProps) => (
    <text>decorated[{Raw ? <Raw {...props} /> : null}]</text>
  );
}

class Wrapper extends BaseSlotPlugin<'Wrapper'> {
  static readonly key = 'wrapper';

  readonly type = 'Wrapper';

  readonly Component = ({ children, type }: WrapperProps) => (
    <view className={`wrapper-${type}`}>{children}</view>
  );
}

test('slot overrides compose Raw in declaration order and update when disabled', async () => {
  const view = render(
    <SlotProvider plugins={[Original, Decorated, Wrapper]}>
      <Paragraph {...nodeProps}>hello</Paragraph>
    </SlotProvider>,
  );

  expect(view.container.textContent).toBe('decorated[original:hello]');

  expect(view.container.querySelector('.wrapper-Paragraph')).not.toBeNull();

  view.rerender(
    <SlotProvider plugins={[Original, [Decorated, { disabled: true }], Wrapper]}>
      <Paragraph {...nodeProps}>next</Paragraph>
    </SlotProvider>,
  );

  await waitFor(() => expect(view.container.textContent).toBe('original:next'));
});

test('nested heading emphasis keeps explicit font size and reacts to its own theme', () => {
  const content = (
    <SlotProvider plugins={[HeadingSlotPlugin, StrongSlotPlugin, EmphasisSlotPlugin]}>
      <Heading {...nodeProps} level={1}>
        <Strong {...nodeProps}>
          <Emphasis {...nodeProps}>nested</Emphasis>
        </Strong>
      </Heading>
    </SlotProvider>
  );

  const view = render(<ThemeProvider value={LIGHT_THEME}>{content}</ThemeProvider>);

  const emphasis = view.container.querySelector('.fluxdown-emphasis');

  expect(emphasis?.getAttribute('style')).toMatch(/font-size:\s*32px/);

  expect(emphasis?.getAttribute('style')).toMatch(/font-style:\s*italic/);

  expect(emphasis?.getAttribute('style')).toMatch(/font-weight:\s*650/);

  view.rerender(
    <ThemeProvider
      value={resolveTheme(['dark', { tokens: { heading: { h1: { fontSize: '40px' } } } }])}
    >
      {content}
    </ThemeProvider>,
  );

  expect(view.container.querySelector('.fluxdown-emphasis')?.getAttribute('style')).toMatch(
    /font-size:\s*40px/,
  );

  expect(view.container.querySelector('.fluxdown-emphasis')?.getAttribute('style')).toContain(
    'rgb(236, 236, 241)',
  );
});

test('slot errors render the supplied fallback and recover after their input changes', async () => {
  class Broken extends BaseSlotPlugin<'Paragraph'> {
    static readonly key = 'broken';

    readonly type = 'Paragraph';

    readonly Component = ({ children }: ParagraphProps) => {
      if (children === 'fail') {
        throw new Error('failed slot');
      }

      return <text>{children}</text>;
    };
  }

  class Fallback extends BaseSlotPlugin<'Fallback'> {
    static readonly key = 'fallback';

    readonly type = 'Fallback';

    readonly Component = ({ type }: FallbackProps) => <text>failed:{type}</text>;
  }

  const view = render(
    <SlotProvider plugins={[Broken, Fallback]}>
      <Paragraph {...nodeProps}>fail</Paragraph>
    </SlotProvider>,
  );

  await waitFor(() => expect(view.container.textContent).toBe('failed:Paragraph'));

  view.rerender(
    <SlotProvider plugins={[Broken, Fallback]}>
      <Paragraph {...nodeProps}>recovered</Paragraph>
    </SlotProvider>,
  );

  await waitFor(() => expect(view.container.textContent).toBe('recovered'));
});

test('equivalent slot lists keep their instance and release it on unmount', async () => {
  let created = 0;

  let destroyed = 0;

  class Tracked extends Original {
    constructor() {
      super();

      created += 1;
    }

    destroy() {
      destroyed += 1;
    }
  }

  const view = render(
    <SlotProvider plugins={[Tracked]}>
      <Paragraph {...nodeProps}>first</Paragraph>
    </SlotProvider>,
  );

  view.rerender(
    <SlotProvider plugins={[Tracked]}>
      <Paragraph {...nodeProps}>second</Paragraph>
    </SlotProvider>,
  );

  expect(created).toBe(1);

  expect(destroyed).toBe(0);

  view.unmount();

  await Promise.resolve();

  expect(destroyed).toBe(1);
});

test('falsey slot errors recover when a renderer is replaced with the same input', async () => {
  class Broken extends BaseSlotPlugin<'Paragraph'> {
    static readonly key = 'broken-falsey';

    readonly type = 'Paragraph';

    readonly Component = () => {
      throw 0;
    };
  }

  class Fallback extends BaseSlotPlugin<'Fallback'> {
    static readonly key = 'fallback-falsey';

    readonly type = 'Fallback';

    readonly Component = () => <text>failed</text>;
  }

  const content = <Paragraph {...nodeProps}>same</Paragraph>;

  const view = render(<SlotProvider plugins={[Broken, Fallback]}>{content}</SlotProvider>);

  await waitFor(() => expect(view.container.textContent).toBe('failed'));

  view.rerender(<SlotProvider plugins={[Original, Fallback]}>{content}</SlotProvider>);

  await waitFor(() => expect(view.container.textContent).toBe('original:same'));
});
