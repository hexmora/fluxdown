import { View } from 'react-native';

import type { BlockquoteProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';

export const BlockquoteRenderer = (props: BlockquoteProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { colors, styles } = useNativeTheme();

  const parent = props.parents?.at(-1);

  const nested = parent?.type === 'element';

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[
        {
          borderLeftWidth: 3,
          borderLeftColor: colors.borderEmphasis,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          marginVertical: nested ? 8 : 16,
          backgroundColor: colors.quoteBackground,
        },
        styles.blockquote,
        style,
      ]}
    >
      {children}
    </View>
  );
};
