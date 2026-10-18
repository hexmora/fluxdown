import { Platform, Text } from 'react-native';

import type { CodeHighlighterProps } from '../../base';

import { useNativeTheme } from '../../base';

export const PlainCodeRenderer = ({
  code,
  suffix,
  style,
  nativeID,
  testID,
  accessibilityLabel,
}: CodeHighlighterProps) => {
  const { colors, styles, selectable } = useNativeTheme();

  return (
    <Text
      selectable={selectable}
      nativeID={nativeID}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          color: colors.text,
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          fontSize: 14,
          lineHeight: 23.1,
          padding: 16,
        },
        styles.code,
        style,
      ]}
    >
      {code}
      {suffix}
    </Text>
  );
};
