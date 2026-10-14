import type { AnySlotPluggable } from '@fluxdown/react-base-presets/base';
import type { ComponentType, ReactNode } from 'react';

import { render, screen, within } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { Fluxdown } from '..';

interface ParagraphSlotProps {
  Raw: ComponentType<Omit<ParagraphSlotProps, 'Raw'>> | null;

  children?: ReactNode;
}

const createParagraphSlotPlugin = (
  key: string,
  Component: ComponentType<ParagraphSlotProps>,
): AnySlotPluggable =>
  class ParagraphSlotPlugin {
    static readonly key = key;

    readonly config = {};

    readonly type = 'Paragraph' as const;

    readonly Component = Component;

    destroy() {}
  } as unknown as AnySlotPluggable;

const First = ({ children }: ParagraphSlotProps) => <Text testID="slot-a">A[{children}]</Text>;

const Second = ({ Raw, children }: ParagraphSlotProps) => (
  <Text testID="slot-b">B[{Raw ? <Raw>{children}</Raw> : children}]</Text>
);

describe('Fluxdown native slots', () => {
  test('composes slot plugins in pack order with Raw', () => {
    render(
      <Fluxdown
        text="hello"
        plugins={[
          {
            slots: [
              createParagraphSlotPlugin('native-slot-a', First),
              createParagraphSlotPlugin('native-slot-b', Second),
            ],
          },
        ]}
      />,
    );

    expect(screen.getByTestId('slot-b')).toHaveTextContent('B[A[hello]]');
  });

  test('isolates slot plugin composition between instances', () => {
    render(
      <>
        <View testID="first">
          <Fluxdown
            text="first"
            plugins={[{ slots: [createParagraphSlotPlugin('native-isolated-a', First)] }]}
          />
        </View>
        <View testID="second">
          <Fluxdown
            text="second"
            plugins={[{ slots: [createParagraphSlotPlugin('native-isolated-b', Second)] }]}
          />
        </View>
      </>,
    );

    const first = within(screen.getByTestId('first'));

    const second = within(screen.getByTestId('second'));

    expect(first.getByTestId('slot-a')).toHaveTextContent('A[first]');

    expect(first.queryByTestId('slot-b')).toBeNull();

    expect(second.getByTestId('slot-b')).toHaveTextContent('B[second]');

    expect(second.queryByTestId('slot-a')).toBeNull();
  });
});
