import { Platform, Text } from 'react-native';

import type { TexProps } from '../../../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../../../base';

export const Fallback = (props: TexProps) => {
  const {
    tex,
    mode = 'inline',
    style,
    nativeID,
    testID,
    accessibilityLabel,
  } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { colors, styles, selectable } = useNativeTheme();

  return (
    <Text
      selectable={selectable}
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[
        { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
        mode === 'display' ? { textAlign: 'center', marginVertical: 16, fontSize: 16 } : undefined,
        styles.tex,
        style,
      ]}
    >
      {tex}
    </Text>
  );
};
