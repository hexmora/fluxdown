import type { Element } from 'hast';
import type { ComponentProps, ComponentType } from 'react';

import { render, screen } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';

import type { ParagraphProps, SlotInputProps } from '..';

import { BaseSlotPlugin, createTypeOfSlot, SlotProvider } from '..';

const paragraphNode: Element = {
  children: [],
  properties: {},
  tagName: 'p',
  type: 'element',
};

const FirstParagraph = ({ children }: ParagraphProps) => <span>first:{children}</span>;

const SecondParagraph = ({ Raw, ...props }: ParagraphProps) => (
  <span data-testid="factory-second">second:[{Raw ? <Raw {...props} /> : props.children}]</span>
);

class FirstParagraphPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-factory-first-paragraph';

  readonly Component = FirstParagraph;

  readonly type = 'Paragraph';
}

class SecondParagraphPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-factory-second-paragraph';

  readonly Component = SecondParagraph;

  readonly type = 'Paragraph';
}

const Paragraph = createTypeOfSlot('Paragraph');

const paragraph = (
  <Paragraph current={paragraphNode} parents={[]} render={() => null}>
    content
  </Paragraph>
);

const preventExpectedError = (event: ErrorEvent) => event.preventDefault();

describe('createTypeOfSlot', () => {
  test('infers the exact prop contract for the requested slot type', () => {
    expectTypeOf<typeof Paragraph>().toEqualTypeOf<ComponentType<SlotInputProps<'Paragraph'>>>();

    expectTypeOf<ComponentProps<typeof Paragraph>>().toEqualTypeOf<SlotInputProps<'Paragraph'>>();

    expectTypeOf<ComponentProps<typeof Paragraph>>().not.toHaveProperty('Raw');
  });

  test('requires a provider when the typed slot is rendered', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    window.addEventListener('error', preventExpectedError);

    try {
      expect(() => render(paragraph)).toThrow(/slot.*(?:provider|context)|context.*required/i);
    } finally {
      window.removeEventListener('error', preventExpectedError);

      consoleError.mockRestore();
    }
  });

  test('throws when a required slot has no platform plugin', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    window.addEventListener('error', preventExpectedError);

    try {
      expect(() => render(<SlotProvider plugins={[]}>{paragraph}</SlotProvider>)).toThrow(
        /Paragraph slot is required/,
      );
    } finally {
      window.removeEventListener('error', preventExpectedError);

      consoleError.mockRestore();
    }
  });

  test('allows the optional code header slot to be absent', () => {
    const CodeHeader = createTypeOfSlot('CodeHeader');

    const view = render(
      <SlotProvider plugins={[]}>
        <CodeHeader code="code" />
      </SlotProvider>,
    );

    expect(view.container).toBeEmptyDOMElement();
  });

  test('does not hide a missing child slot behind a parent slot error boundary', () => {
    const Node = createTypeOfSlot('Node');

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    window.addEventListener('error', preventExpectedError);

    try {
      expect(() =>
        render(
          <SlotProvider plugins={[FirstParagraphPlugin]}>
            <Paragraph current={paragraphNode} parents={[]} render={() => null}>
              <Node
                getProps={() => ({})}
                current={{ type: 'text', value: 'missing' }}
                parents={[]}
                render={() => null}
                renderChildren={() => null}
              />
            </Paragraph>
          </SlotProvider>,
        ),
      ).toThrow(/Node slot is required/);
    } finally {
      window.removeEventListener('error', preventExpectedError);

      consoleError.mockRestore();
    }
  });

  test('uses the existing Raw composition boundary in declaration order', () => {
    render(
      <SlotProvider plugins={[FirstParagraphPlugin, SecondParagraphPlugin]}>
        {paragraph}
      </SlotProvider>,
    );

    expect(screen.getByTestId('factory-second')).toHaveTextContent('second:[first:content]');
  });

  test('injects Raw without invalidating memoized equivalent input props', () => {
    const capture = jest.fn();

    class CapturingParagraphPlugin extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'test-memoized-paragraph';

      readonly Component = (props: ParagraphProps) => {
        capture(props.Raw);

        return <span>{props.children}</span>;
      };

      readonly type = 'Paragraph';
    }

    const props: SlotInputProps<'Paragraph'> = {
      children: 'memoized',
      current: paragraphNode,
      parents: [],
      render: () => null,
    };

    const StyledParagraph = createTypeOfSlot<
      'Paragraph',
      SlotInputProps<'Paragraph'> & { style?: { color: string } }
    >('Paragraph');

    const view = (color: string) => (
      <SlotProvider plugins={[CapturingParagraphPlugin]}>
        <StyledParagraph {...props} style={{ color }} />
      </SlotProvider>
    );

    const { rerender } = render(view('red'));

    expect(capture).toHaveBeenCalledTimes(1);

    expect(capture).toHaveBeenCalledWith(null);

    rerender(view('red'));

    expect(capture).toHaveBeenCalledTimes(1);

    rerender(view('blue'));

    expect(capture).toHaveBeenCalledTimes(2);

    expect(capture).toHaveBeenLastCalledWith(null);
  });
});

describe('BaseSlotPlugin', () => {
  test('provides empty config and an idempotent no-op destroy by default', () => {
    const plugin = new FirstParagraphPlugin();

    expect(plugin.config).toEqual({});

    expect(plugin.destroy()).toBeUndefined();

    expect(plugin.destroy()).toBeUndefined();
  });
});
