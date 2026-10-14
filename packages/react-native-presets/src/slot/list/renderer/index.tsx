import { View } from 'react-native';

import type { ListProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';

export const ListRenderer = (props: ListProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { styles } = useNativeTheme();

  const parent = props.parents?.at(-1);

  const nested = parent?.type === 'element';

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[{ marginTop: nested ? 4 : 0, marginBottom: nested ? 0 : 12 }, styles.list, style]}
    >
      {children}
    </View>
  );
};
