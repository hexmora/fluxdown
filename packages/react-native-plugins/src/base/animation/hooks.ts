import { useStatic } from '@fluxdown/react-hooks';
import { useLayoutEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

const getProgress = (start: number, duration: number) =>
  start < 0 || duration <= 0 ? 1 : Math.min(1, Math.max(0, performance.now() - start) / duration);

export const useAppear = (start: number, duration: number) => {
  const progress = useStatic(() => new Animated.Value(getProgress(start, duration)));

  const [complete, setComplete] = useState(() => getProgress(start, duration) >= 1);

  useLayoutEffect(() => {
    const current = getProgress(start, duration);

    const remaining = duration * (1 - current);

    progress.setValue(current);

    setComplete(current >= 1);

    if (remaining === 0) {
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      easing: Easing.linear,
      useNativeDriver: false,
      isInteraction: false,
    });

    animation.start(({ finished }) => finished && setComplete(true));

    return () => animation.stop();
  }, [duration, progress, start]);

  return { complete, progress };
};
