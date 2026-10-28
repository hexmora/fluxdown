import type { ParagraphProps } from '@fluxdown/solid-plugins/base';
import type { IPluginItem } from '@fluxdown/solid-plugins/typings';
import type { Root } from 'hast';

import { SyntaxSoftEndlineRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-soft-endline';
import { BaseSlotPlugin, PREFIX } from '@fluxdown/solid-plugins/base';
import {
  ParagraphPlugin,
  ParagraphRenderPlugin,
  ParagraphSlotPlugin,
} from '@fluxdown/solid-plugins/plugins/paragraph';
import { render } from '@solidjs/testing-library';
import { createContext, createSignal, onCleanup, splitProps, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { FluxdownRef } from '../packs/raw';
import type { Theme } from '../types';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

class ExtendedParagraph extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-extended-paragraph';

  readonly type = 'Paragraph';

  readonly Component = (props: ParagraphProps) => {
    const [local, rest] = splitProps(props, ['Raw']);

    return (
      <section data-custom="paragraph">
        <Dynamic component={local.Raw ?? undefined} {...rest} />
      </section>
    );
  };
}

describe('Fluxdown components', () => {
  test('preserves sibling elements cloned with the same source position', () => {
    class CloneParagraph {
      static readonly key = 'test-clone-paragraph';

      readonly config = {};

      readonly plugin = () => (tree: Root) => {
        const paragraph = tree.children.find(
          (node) => node.type === 'element' && node.tagName === 'p',
        );

        if (paragraph?.type === 'element') {
          tree.children.push({ ...paragraph, children: [{ type: 'text', value: 'cloned' }] });
        }
      };

      destroy() {}
    }

    const { container } = render(() => (
      <FluxdownLite text="original" plugins={{ rehypes: [CloneParagraph] }} />
    ));

    expect([...container.querySelectorAll('p')].map((node) => node.textContent)).toEqual([
      'original',
      'cloned',
    ]);
  });

  test.each([Fluxdown, FluxdownLite])('renders common Markdown with preset slots', (Component) => {
    const text =
      '# Heading\n\nA **strong** and *emphasized* [link](https://example.com) with `code`.\n\n> quote\n\n1. first\n2. second\n\n---\n\n```ts\nconst answer = 42;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |';

    const { container } = render(() => <Component text={text} />);

    expect(container.querySelector('h1')?.textContent).toBe('Heading');

    expect(container.querySelector('strong')?.textContent).toBe('strong');

    expect(container.querySelector('em')?.textContent).toBe('emphasized');

    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');

    expect(container.querySelectorAll('ol li')).toHaveLength(2);

    expect(container.querySelector('blockquote')?.textContent?.trim()).toBe('quote');

    expect(container.querySelector('pre code')?.textContent).toBe('const answer = 42;');

    expect(container.querySelectorAll('table tbody td')).toHaveLength(2);
  });

  test('updates source without replacing completed blocks or retained inline nodes', () => {
    const [text, setText] = createSignal('first\n\n**second**');

    const { container } = render(() => <FluxdownLite text={text()} />);

    const first = container.querySelector('p');

    const strong = container.querySelector('strong');

    setText('first\n\n**second appended**');

    expect(container.querySelector('p')).toBe(first);

    expect(container.querySelector('strong')).toBe(strong);

    expect(container.textContent).toBe('firstsecond appended');

    setText('');

    expect(container.textContent).toBe('');
  });

  test('raw uses only explicitly configured renderers and slots', () => {
    const empty = render(() => <FluxdownRaw text="content" plugins={[]} />);

    expect(empty.container.textContent).toBe('');

    const configured = render(() => <FluxdownRaw text="content" plugins={ParagraphPlugin} />);

    expect(configured.container.querySelector('p')?.textContent).toBe('');
  });

  test('extends slots and accepts reactive Solid class, style and element attributes', () => {
    const [className, setClassName] = createSignal('initial');

    const [padding, setPadding] = createSignal('1px');

    const { container } = render(() => (
      <FluxdownLite
        text="content"
        plugins={{ slots: [ExtendedParagraph] }}
        class={className()}
        style={{ padding: padding() }}
        aria-label="Markdown"
      />
    ));

    expect(container.querySelector('[data-custom="paragraph"] p')?.textContent).toBe('content');

    setClassName('updated');

    setPadding('2px');

    const root = container.firstElementChild as HTMLElement;

    expect(root.className.split(/\s+/).filter((name) => name === 'updated')).toHaveLength(1);

    expect(root.classList.contains('initial')).toBe(false);

    expect(root.getAttribute('aria-label')).toBe('Markdown');

    expect(root.style.padding).toBe('2px');
  });

  test('disables individual parser and render presets and restores them reactively', () => {
    const [plugins, setPlugins] = createSignal<IPluginItem[]>([
      {
        remarks: [[SyntaxSoftEndlineRemarkPlugin, { disabled: true }]],
        renders: [[ParagraphRenderPlugin, { disabled: true }]],
      },
    ]);

    const { container } = render(() => <FluxdownLite text={'first\nsecond'} plugins={plugins()} />);

    expect(container.querySelector('br')).toBeNull();

    expect(container.querySelector('p')?.className).toBe('');

    setPlugins([]);

    expect(container.querySelector('br')).not.toBeNull();

    expect(container.querySelector('p')?.className).not.toBe('');
  });

  test('removes disabled slots from the Raw composition chain', () => {
    class PlainParagraph extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'test-plain-paragraph';

      readonly type = 'Paragraph';

      readonly Component = (props: ParagraphProps) => {
        return <section>{props.children}</section>;
      };
    }

    const { container } = render(() => (
      <FluxdownLite
        text="custom paragraph"
        plugins={{ slots: [[ParagraphSlotPlugin, { disabled: true }], PlainParagraph] }}
      />
    ));

    expect(container.querySelector('section')?.textContent).toBe('custom paragraph');

    expect(container.querySelector('p')).toBeNull();
  });

  test('updates theme tokens without recompiling content', () => {
    const [theme, setTheme] = createSignal<Theme>('light');

    const { container } = render(() => <FluxdownLite text="# Theme" theme={theme()} />);

    const heading = container.querySelector('h1');

    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue(`--${PREFIX}-colors-bg`)).toBe('#ffffff');

    setTheme(['dark', { tokens: { colors: { accent: 'hotpink' } } }]);

    expect(container.querySelector('h1')).toBe(heading);

    expect(root.style.getPropertyValue(`--${PREFIX}-colors-accent`)).toBe('hotpink');
  });

  test('preserves consumer context and disposes slots created after an asynchronous append', async () => {
    const Context = createContext('missing');

    const mounted = vi.fn();

    const cleaned = vi.fn();

    class OwnedParagraph extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'test-owned-paragraph';

      readonly type = 'Paragraph';

      readonly Component = (props: ParagraphProps) => {
        const label = useContext(Context);

        mounted(label);

        onCleanup(cleaned);

        return <p data-context={label}>{props.children}</p>;
      };
    }

    const [text, setText] = createSignal('first');

    const { container, unmount } = render(() => (
      <Context.Provider value="available">
        <FluxdownLite text={text()} plugins={{ slots: [OwnedParagraph] }} />
      </Context.Provider>
    ));

    await Promise.resolve();

    setText('first\n\nsecond');

    expect(container.querySelectorAll('[data-context="available"]')).toHaveLength(2);

    expect(mounted.mock.calls).toEqual([['available'], ['available']]);

    unmount();

    expect(cleaned).toHaveBeenCalledTimes(2);
  });

  test('exposes the readable Core through ref and releases it on unmount', () => {
    let core: FluxdownRef | undefined;

    const { unmount } = render(() => (
      <FluxdownLite
        text="content"
        ref={(value) => {
          core = value;
        }}
      />
    ));

    expect(core?.value.value.length).toBeGreaterThan(0);

    unmount();

    expect(core?.value.closed).toBe(true);
  });
});
