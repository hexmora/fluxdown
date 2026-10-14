import { Text } from 'react-native';

import type { EmphasisProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';

export const EmphasisRenderer = (props: EmphasisProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { styles } = useNativeTheme();

  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[{ fontStyle: 'italic' }, styles.emphasis, style]}
    >
      {children}
    </Text>
  );
};
