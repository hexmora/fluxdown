import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

import type { SuffixRendererProps } from './type';

import { useNativeTheme } from '../../base';
import { useReducedMotion } from '../effects/use-reduced-motion';

export * from './type';

export const SuffixRenderer = ({ children, type }: SuffixRendererProps) => {
  const { colors, styles } = useNativeTheme();
  const textStyle = StyleSheet.flatten(styles.text);
  const fontSize = textStyle?.fontSize ?? 16;
  const lineHeight = textStyle?.lineHeight ?? fontSize * 1.65;
  const opacity = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    opacity.setValue(1);
    if (reduced) return;

    const fade = (toValue: number) =>
      Animated.timing(opacity, {
        toValue,
        duration: 1000 / 6,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        useNativeDriver: true,
      });
    const animation = Animated.loop(
      Animated.sequence([Animated.delay(1000 / 3), fade(0), Animated.delay(1000 / 3), fade(1)]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduced]);

  const custom = type !== 'cursor' && type !== 'dot';
  const markerSize = type === 'dot' ? fontSize * 0.624 : fontSize;

  return (
    <Text
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 0 }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          opacity,
          width:
            type === 'dot'
              ? markerSize
              : type === 'cursor'
                ? (lineHeight * 0.39) / 1.65
                : undefined,
          height: custom ? lineHeight : markerSize,
          marginLeft: fontSize * 0.18,
          marginRight:
            type === 'dot'
              ? -markerSize - fontSize * 0.18
              : (-lineHeight * 0.39) / 1.65 - fontSize * 0.18,
          borderRadius: type === 'dot' ? markerSize / 2 : fontSize * 0.06,
          backgroundColor: custom ? undefined : (textStyle?.color ?? colors.text),
        }}
      >
        {custom ? <Text>{children}</Text> : children}
      </Animated.View>
    </Text>
  );
};
