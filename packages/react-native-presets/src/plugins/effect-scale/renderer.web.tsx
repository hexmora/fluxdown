import type { TextStyle } from 'react-native';

import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { ScaleRendererProps, ScaleWordRendererProps } from './type';

import { useReducedMotion } from '../effects/use-reduced-motion';

const styles = StyleSheet.create({
  word: { display: 'inline-block' } as unknown as TextStyle,
  glyph: { display: 'inline-block', transformOrigin: 'center bottom' } as unknown as TextStyle,
});

export const ScaleWordRenderer = ({ children }: ScaleWordRendererProps) => (
  <Text style={styles.word}>{children}</Text>
);

export const ScaleRenderer = ({ children, start, duration, from, blur }: ScaleRendererProps) => {
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - performance.now()) : 0), [start]);
  const reduced = useReducedMotion();
  const active = start >= 0 && delay > -duration && !reduced;
  // React Native Web registers CSS keyframes through StyleSheet, not inline styles.
  const entrance = useMemo(
    () =>
      StyleSheet.create({
        appear: {
          animationTimingFunction: 'linear',
          animationKeyframes: Object.fromEntries(
            Array.from({ length: 11 }, (_, index) => {
              const progress = index / 10;
              return [
                `${index * 10}%`,
                {
                  opacity: Math.round((1 - (1 - progress) ** 3) ** 2 * 1000000) / 1000000,
                  filter: `blur(${(blur * Math.round(Math.cos((progress * Math.PI) / 2) * 1000000)) / 1000000}em)`,
                },
              ];
            }),
          ),
        } as TextStyle,
        grow: {
          animationTimingFunction: 'cubic-bezier(0.333333, 1, 0.666667, 1)',
          animationKeyframes: {
            from: { transform: `scale(${from})` },
            to: { transform: 'scale(1)' },
          },
        } as unknown as TextStyle,
      }),
    [from, blur],
  );
  const animation = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationFillMode: 'both',
  } as TextStyle;

  return (
    <Text key={start} style={[styles.word, active && entrance.appear, active && animation]}>
      <Text style={[styles.glyph, active && entrance.grow, active && animation]}>{children}</Text>
    </Text>
  );
};
