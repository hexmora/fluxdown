import { Animated, Text } from 'react-native';

import type { ScaleRendererProps, ScaleWordRendererProps } from './type';

import { useProgress } from '../effects/use-progress';

const grow = (value: number) => 1 - (1 - value) ** 3;

export const ScaleWordRenderer = ({ children }: ScaleWordRendererProps) => <Text>{children}</Text>;

export const ScaleRenderer = ({ children, start, duration, from }: ScaleRendererProps) => {
  const progress = useProgress(start, duration);
  const inputRange = Array.from({ length: 11 }, (_, index) => index / 10);
  const opacity = progress.interpolate({
    inputRange,
    outputRange: inputRange.map((value) => grow(value) ** 2),
  });
  const scale = progress.interpolate({
    inputRange,
    outputRange: inputRange.map((value) => from + (1 - from) * grow(value)),
  });

  return (
    <Animated.Text style={{ opacity, transform: [{ scale }], transformOrigin: 'center bottom' }}>
      {children}
    </Animated.Text>
  );
};
