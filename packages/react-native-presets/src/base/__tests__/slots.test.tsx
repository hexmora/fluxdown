import type { Element } from 'hast';

import { BaseSlotPlugin, createTypeOfSlot, SlotProvider } from '@fluxdown/react-base-presets/base';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { FallbackProps, ParagraphProps, SlotInputProps, WrapperProps } from '..';

const current: Element = { type: 'element', tagName: 'p', properties: {}, children: [] };

const Paragraph = createTypeOfSlot<'Paragraph', SlotInputProps<'Paragraph'>>('Paragraph');

const props: SlotInputProps<'Paragraph'> = {
  current,
  parents: [],
  render: () => null,
  children: 'content',
};

class First extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'slot-test-first';

  readonly type = 'Paragraph';

  readonly Component = ({ children }: ParagraphProps) => <Text>first:{children}</Text>;
}

class Second extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'slot-test-second';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...input }: ParagraphProps) => (
    <Text>second:[{Raw ? <Raw {...input} /> : input.children}]</Text>
  );
}

describe('native slots', () => {
  test('composes Raw in declaration order', () => {
    render(
      <SlotProvider plugins={[First, Second]}>
        <Paragraph {...props} />
      </SlotProvider>,
    );

    expect(screen.getByText('second:[first:content]')).toBeOnTheScreen();
  });

  test('throws when a required slot has no platform plugin', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() =>
        render(
          <SlotProvider plugins={[]}>
            <Paragraph {...props} />
          </SlotProvider>,
        ),
      ).toThrow(/Paragraph slot is required/);
    } finally {
      error.mockRestore();
    }
  });

  test('requires a provider', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() => render(<Paragraph {...props} />)).toThrow(/SlotProvider/);
    } finally {
      error.mockRestore();
    }
  });

  test('compares flattened native styles when memoizing a slot', () => {
    const capture = jest.fn();

    class Capturing extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'slot-test-capturing';

      readonly type = 'Paragraph';

      readonly Component = (input: ParagraphProps) => {
        capture(input.Raw);

        return <Text>{input.children}</Text>;
      };
    }

    const content = (color: string) => (
      <SlotProvider plugins={[Capturing]}>
        <Paragraph {...props} style={[{ color }]} />
      </SlotProvider>
    );

    const view = render(content('red'));

    view.rerender(content('red'));

    expect(capture).toHaveBeenCalledTimes(1);

    view.rerender(content('blue'));

    expect(capture).toHaveBeenCalledTimes(2);
  });

  test('wraps native slots and replaces thrown errors with Fallback', () => {
    class Wrapper extends BaseSlotPlugin<'Wrapper'> {
      static readonly key = 'slot-test-wrapper';

      readonly type = 'Wrapper';

      readonly Component = ({ children, type }: WrapperProps) => (
        <Text>
          {type}:{children}
        </Text>
      );
    }

    const view = render(
      <SlotProvider plugins={[First, Wrapper]}>
        <Paragraph {...props} />
      </SlotProvider>,
    );

    expect(screen.getByText('Paragraph:first:content')).toBeOnTheScreen();

    view.unmount();

    class Broken extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'slot-test-broken';

      readonly type = 'Paragraph';

      readonly Component = () => {
        throw new Error('broken native slot');
      };
    }

    class Fallback extends BaseSlotPlugin<'Fallback'> {
      static readonly key = 'slot-test-fallback';

      readonly type = 'Fallback';

      readonly Component = ({ type }: FallbackProps) => <Text>fallback:{type}</Text>;
    }

    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      render(
        <SlotProvider plugins={[Broken, Fallback]}>
          <Paragraph {...props} />
        </SlotProvider>,
      );

      expect(screen.getByText('fallback:Paragraph')).toBeOnTheScreen();
    } finally {
      error.mockRestore();
    }
  });
});
