import { Text } from 'react-native';

import type { BreakLineProps } from '../../../base';

export const BreakLineRenderer = (props: BreakLineProps) => {
  const { style, nativeID, testID, accessibilityLabel } = props;

  return (
    <Text accessibilityLabel={accessibilityLabel} nativeID={nativeID} testID={testID} style={style}>
      {'\n'}
    </Text>
  );
};
