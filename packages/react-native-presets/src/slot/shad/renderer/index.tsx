import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

import type { ShadProps } from '../../../base';

export const ShadRenderer = ({ leading, active, isActive }: ShadProps) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
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
  }, [active, isActive, opacity]);

  return (
    <Text>
      {leading}
      <Animated.Text style={{ opacity }}>{active}</Animated.Text>
    </Text>
  );
};
