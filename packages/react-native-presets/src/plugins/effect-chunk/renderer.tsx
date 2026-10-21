import { Animated, Easing } from 'react-native';

import type { ChunkRendererProps } from './type';

import { useProgress } from '../effects/use-progress';

export const ChunkRenderer = ({ children, start, duration }: ChunkRendererProps) => {
  const progress = useProgress(start, duration);
  const inputRange = Array.from({ length: 21 }, (_, index) => index / 20);
  const easeOut = Easing.bezier(0, 0, 0.58, 1);
  const opacity = progress.interpolate({ inputRange, outputRange: inputRange.map(easeOut) });

  return <Animated.Text style={{ opacity }}>{children}</Animated.Text>;
};
