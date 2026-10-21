import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

import type { ShadRendererProps } from '../../../plugins/effect-shad/type';

import { useReducedMotion } from '../../../plugins/effects/use-reduced-motion';

export const ShadRenderer = ({
  leading,
  active,
  isActive,
}: Omit<ShadRendererProps, 'maskWidth'> & { maskWidth?: number }) => {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive || reduced) {
      opacity.setValue(1);

      return;
    }

    opacity.setValue(0.45);

    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [active, isActive, opacity, reduced]);

  return (
    <Text>
      {leading}
      <Animated.Text style={{ opacity }}>{active}</Animated.Text>
    </Text>
  );
};
