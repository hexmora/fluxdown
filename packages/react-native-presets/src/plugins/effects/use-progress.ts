import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { useReducedMotion } from './use-reduced-motion';

/** Resume the original entrance after Markdown reparsing remounts an inline node. */
export const useProgress = (start: number, duration: number) => {
  const reduced = useReducedMotion();
  const elapsedAtRender = start < 0 ? duration : Math.max(0, performance.now() - start);
  const initialValue = duration <= 0 || reduced ? 1 : Math.min(1, elapsedAtRender / duration);
  const progress = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    const elapsed = start < 0 ? duration : Math.max(0, performance.now() - start);
    const initial = duration <= 0 || reduced ? 1 : Math.min(1, elapsed / duration);
    progress.setValue(initial);

    if (initial >= 1) return;

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: Math.max(0, duration - elapsed),
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [duration, progress, reduced, start]);

  return progress;
};
