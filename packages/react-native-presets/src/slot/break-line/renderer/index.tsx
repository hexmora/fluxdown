import { Text } from 'react-native';

import type { BreakLineProps } from '../../../base';

import { getReactNativeProps } from '../../../base';

export const BreakLineRenderer = (props: BreakLineProps) => {
  const { style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  return (
    <Text accessibilityLabel={accessibilityLabel} nativeID={nativeID} testID={testID} style={style}>
      {'\n'}
    </Text>
  );
};
