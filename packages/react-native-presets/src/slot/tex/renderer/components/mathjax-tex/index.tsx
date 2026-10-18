import { texToSvg } from '@fluxdown/react-base-presets/math';
import { useMemo } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { TexProps } from '../../../../../base';

import { useNativeTheme } from '../../../../../base';
import { Fallback } from '../fallback';
import { getSvg } from './utils';

const MathjaxTex = (props: TexProps) => {
  const { tex, mode = 'inline', style, nativeID, testID, accessibilityLabel } = props;

  const { colors, styles } = useNativeTheme();

  const svg = useMemo(() => getSvg(texToSvg(tex, mode)), [tex, mode]);

  if (!svg) {
    return <Fallback {...props} />;
  }

  const formula = (
    <SvgXml
      {...(Platform.OS === 'web'
        ? {
            role: 'img',
            'aria-label': accessibilityLabel ?? tex,
            id: nativeID,
            'data-testid': testID,
          }
        : {
            accessible: true,
            accessibilityLabel: accessibilityLabel ?? tex,
            accessibilityRole: 'image',
            nativeID,
            testID,
          })}
      xml={svg.xml}
      width={svg.width}
      height={svg.height}
      color={colors.text}
      style={[styles.tex, style]}
    />
  );

  return mode === 'display' ? (
    <ScrollView
      horizontal
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 8 }}
      style={{ marginVertical: 16 }}
    >
      {formula}
    </ScrollView>
  ) : (
    <View collapsable={false} style={{ width: svg.width, height: svg.height }}>
      {formula}
    </View>
  );
};

export default MathjaxTex;
