import type { TextStyle } from 'react-native';

import { Text } from 'react-native';

import type { HeadingProps, MarkdownStyles } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';

const HEADING_STYLES: TextStyle[] = [
  { fontSize: 32, lineHeight: 40, marginTop: 0, marginBottom: 16, letterSpacing: -0.8 },
  { fontSize: 24, lineHeight: 31.2, marginTop: 14, marginBottom: 14, letterSpacing: -0.6 },
  { fontSize: 20, lineHeight: 28, marginTop: 12, marginBottom: 12 },
  { fontSize: 18, lineHeight: 25.2, marginTop: 10, marginBottom: 10 },
  { fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 8 },
  { fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 8 },
];

export const HeadingRenderer = (props: HeadingProps) => {
  const { children, level, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { colors, styles, selectable } = useNativeTheme();

  const headingStyle = HEADING_STYLES[level - 1] ?? HEADING_STYLES[0];

  return (
    <Text
      accessibilityRole="header"
      selectable={selectable}
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[
        {
          color: level >= 5 ? colors.muted : colors.text,
          fontWeight: '600',
        },
        headingStyle,
        styles.text,
        styles[
          `heading${level}` as keyof Pick<
            MarkdownStyles,
            'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
          >
        ],
        style,
      ]}
    >
      {children}
    </Text>
  );
};
