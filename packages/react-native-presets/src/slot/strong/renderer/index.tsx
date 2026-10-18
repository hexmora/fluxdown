import { Text } from 'react-native';

import type { StrongProps } from '../../../base';

import { useNativeTheme } from '../../../base';

export const StrongRenderer = (props: StrongProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = props;

  const { colors, styles } = useNativeTheme();

  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[{ color: colors.text, fontWeight: '700' }, styles.strong, style]}
    >
      {children}
    </Text>
  );
};
