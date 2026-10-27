import { useStatic } from '@fluxdown/react-hooks';
import { useLayoutEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import type { SuffixProps } from '../../../../../base';

import { InheritedText, TextMeasurement } from '../../../../../base';
import { EASE_IN_OUT } from './consts';

export const SuffixRenderer = ({ children, type }: SuffixProps) => {
  const opacity = useStatic(() => new Animated.Value(1));

  const [baseline, setBaseline] = useState<number>();

  useLayoutEffect(() => {
    const start = performance.now();

    let frame: number;

    const tick = () => {
      const phase = ((performance.now() - start) % 1000) / 1000;

      const value =
        phase < 1 / 3
          ? 1
          : phase < 0.5
            ? 1 - EASE_IN_OUT((phase - 1 / 3) * 6)
            : phase < 5 / 6
              ? 0
              : EASE_IN_OUT((phase - 5 / 6) * 6);

      opacity.setValue(value);

      frame = requestAnimationFrame(tick);
    };

    tick();

    return () => cancelAnimationFrame(frame);
  }, [opacity]);

  return (
    <InheritedText>
      {(style) => {
        const { fontSize = 16, lineHeight = fontSize * 1.65, color = 'black' } = style;

        const cursor = type === 'cursor';

        const height = cursor ? fontSize : fontSize * 0.624;

        return (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
            pointerEvents="none"
            style={{ width: 0, height: 0 }}
          >
            <TextMeasurement
              style={style}
              onMeasure={(measurement) => setBaseline(measurement.baseline)}
            >
              {'\u200b'}
            </TextMeasurement>
            <Animated.View
              style={{
                position: 'absolute',
                left: fontSize * 0.18,
                top: -(baseline ?? 0),
                opacity: baseline === undefined ? 0 : opacity,
              }}
            >
              {children !== null && children !== undefined ? (
                <Text style={style}>{children}</Text>
              ) : (
                <View
                  style={{
                    width: cursor ? (lineHeight * 0.39) / 1.65 : height,
                    height,
                    marginTop: (lineHeight - height) / 2,
                    borderRadius: fontSize * (cursor ? 0.06 : 0.312),
                    backgroundColor: color,
                  }}
                />
              )}
            </Animated.View>
          </View>
        );
      }}
    </InheritedText>
  );
};
