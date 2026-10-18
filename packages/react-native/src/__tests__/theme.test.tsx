import type { ParagraphProps } from '@fluxdown/react-native-presets/base';

import { BaseSlotPlugin, getTextContent } from '@fluxdown/react-base-presets/base';
import { useNativeTheme } from '@fluxdown/react-native-presets/base';
import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { Fluxdown } from '..';

describe('Fluxdown native theme', () => {
  test('does not rerender completed blocks for equal inline theme and style objects', () => {
    const renders = jest.fn();

    const Paragraph = ({ current, children }: ParagraphProps) => {
      const { colors } = useNativeTheme();

      renders(getTextContent(current));

      return <Text style={{ color: colors.text }}>{children}</Text>;
    };

    class TrackedParagraph extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'native-theme-render-count';

      readonly type = 'Paragraph';

      readonly Component = Paragraph;
    }

    const content = (text: string) => (
      <Fluxdown
        text={text}
        theme={{ colors: { text: 'blue' } }}
        styles={{ paragraph: [{ fontSize: 18 }] }}
        plugins={[{ slots: [TrackedParagraph] }]}
      />
    );

    const view = render(content('first\n\nsecond'));

    view.rerender(content('first\n\nsecond grows'));

    expect(renders.mock.calls.filter(([text]) => text === 'first')).toHaveLength(1);

    expect(renders).toHaveBeenCalledWith('second grows');
  });

  test('applies partial theme, per-element style arrays and selectable text', () => {
    const view = render(
      <Fluxdown
        text="body"
        theme={['dark', { colors: { text: 'tomato' } }]}
        styles={{ paragraph: [{ fontSize: 20 }, { marginBottom: 4 }] }}
        selectable
      />,
    );

    const paragraph = view
      .UNSAFE_getAllByType(Text)
      .find((node) => StyleSheet.flatten(node.props.style)?.fontSize === 20);

    expect(paragraph).toBeDefined();

    expect(StyleSheet.flatten(paragraph?.props.style)).toEqual(
      expect.objectContaining({ color: 'tomato', fontSize: 20, marginBottom: 4 }),
    );

    expect(paragraph?.props.selectable).toBe(true);
  });

  test('updates inherited color and element styles for unchanged Markdown', () => {
    const view = render(<Fluxdown text="body" theme={{ colors: { text: 'red' } }} />);

    view.rerender(
      <Fluxdown
        text="body"
        theme={{ colors: { text: 'blue' } }}
        styles={{ paragraph: { fontSize: 24 } }}
      />,
    );

    expect(
      view.UNSAFE_getAllByType(Text).some((node) => {
        const style = StyleSheet.flatten(node.props.style);

        return style?.color === 'blue' && style.fontSize === 24;
      }),
    ).toBe(true);
  });
});
