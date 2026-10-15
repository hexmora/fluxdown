import { Text } from 'react-native';

import type { StrongProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';

export const StrongRenderer = (props: StrongProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

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
