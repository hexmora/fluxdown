import type { ReactNode } from 'react';
import type { LayoutRectangle, TextStyle } from 'react-native';

import { useLatestFn } from '@fluxdown/react-hooks';
import { useLayoutEffect, useState } from 'react';
import { PixelRatio, Text, View } from 'react-native';

export type TextMeasurementValue = LayoutRectangle & {
  baseline: number;
  advance: number;
};

export type TextMeasurementProps = {
  children?: ReactNode;
  length?: number;
  style: TextStyle;
  onMeasure: (value: TextMeasurementValue) => void;
};

export const TextMeasurement = ({
  children,
  length = 1,
  style,
  onMeasure,
}: TextMeasurementProps) => {
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);

  const [baseline, setBaseline] = useState<number | null>(null);

  const [anchoredWidth, setAnchoredWidth] = useState<number | null>(null);

  const notify = useLatestFn(onMeasure);

  const width =
    ((style.fontSize ?? 16) * PixelRatio.getFontScale() * 2 + Math.abs(style.letterSpacing ?? 0)) *
    Math.max(length, 1);

  useLayoutEffect(() => {
    if (layout && baseline !== null && anchoredWidth !== null) {
      notify({ ...layout, baseline, advance: Math.max(0, anchoredWidth - layout.width) });
    }
  }, [anchoredWidth, baseline, layout, notify]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        flexDirection: 'row',
        alignItems: 'baseline',
        opacity: 0,
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Text
        selectable={false}
        style={[style, { flexShrink: 0 }]}
        onLayout={({ nativeEvent }) => setLayout(nativeEvent.layout)}
      >
        {children}
      </Text>
      <Text
        selectable={false}
        style={[style, { position: 'absolute', left: 0, top: 0, flexShrink: 0 }]}
        onLayout={({ nativeEvent }) => setAnchoredWidth(nativeEvent.layout.width)}
      >
        {children}
        {'\u2060'}
        <View style={{ width: 0, height: 0 }} />
      </Text>
      <View
        style={{ width: 1, height: 1 }}
        onLayout={({ nativeEvent }) => {
          const { y, height } = nativeEvent.layout;

          setBaseline(y + height);
        }}
      />
    </View>
  );
};
