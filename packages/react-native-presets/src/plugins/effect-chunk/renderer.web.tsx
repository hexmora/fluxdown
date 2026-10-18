import type { TextStyle } from 'react-native';

import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { ChunkRendererProps } from './type';

import { useReducedMotion } from '../effects/use-reduced-motion';

const styles = StyleSheet.create({
  root: { display: 'inline' } as unknown as TextStyle,
  active: {
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    animationKeyframes: { from: { opacity: 0 }, to: { opacity: 1 } },
  } as TextStyle,
});

export const ChunkRenderer = ({ children, start, duration }: ChunkRendererProps) => {
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - performance.now()) : 0), [start]);
  const reduced = useReducedMotion();
  const active = start >= 0 && delay > -duration && !reduced;

  return (
    <Text
      key={start}
      {...{ dataSet: { fluxdownChunk: '1' } }}
      style={[
        styles.root,
        active && styles.active,
        active &&
          ({
            animationDuration: `${duration}ms`,
            animationDelay: `${delay}ms`,
          } as TextStyle),
      ]}
    >
      {children}
    </Text>
  );
};
