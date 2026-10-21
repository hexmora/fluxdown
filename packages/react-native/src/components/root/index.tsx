import type { ViewProps } from 'react-native';

import { useNativeTheme } from '@fluxdown/react-native-presets/base';
import { View } from 'react-native';

export const Root = ({ style, ...props }: ViewProps) => {
  const { colors } = useNativeTheme();

  return <View {...props} style={[{ backgroundColor: colors.background }, style]} />;
};
