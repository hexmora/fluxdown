import type { ReactNode } from 'react';
import type { ColorValue, EasingFunction } from 'react-native';

import { useMemo } from 'react';
import { Animated, processColor } from 'react-native';

import { InheritedText } from '../components';
import { useAppear } from './hooks';

type AppearColorTextProps = {
  children?: ReactNode;
  color: ColorValue;
  easing: EasingFunction;
  progress: Animated.Value;
};

const AppearColorText = ({ children, color, easing, progress }: AppearColorTextProps) => {
  // Nested text opacity does not consistently reach its glyph spans.
  const animatedColor = useMemo(() => {
    const value = processColor(color);

    if (typeof value !== 'number') {
      return color;
    }

    const red = (value >>> 16) & 255;

    const green = (value >>> 8) & 255;

    const blue = value & 255;

    const alpha = (value >>> 24) / 255;

    // Packed zero inherits the parent color in native text spans.
    const hiddenBlue = red === 0 && green === 0 && blue === 0 ? 1 : blue;

    return progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        `rgba(${red},${green},${hiddenBlue},0)`,
        `rgba(${red},${green},${alpha === 0 ? hiddenBlue : blue},${alpha})`,
      ],
      easing,
    });
  }, [color, easing, progress]);

  return <Animated.Text style={{ color: animatedColor }}>{children}</Animated.Text>;
};

export type AppearTextProps = {
  children?: ReactNode;
  start: number;
  duration: number;
  easing: EasingFunction;
};

/**
 * Fade inline text in through its inherited color alpha, resuming from `start` on remount.
 */
export const AppearText = ({ children, duration, easing, start }: AppearTextProps) => {
  const { progress } = useAppear(start, duration);

  return (
    <InheritedText>
      {({ color = 'black' }) => (
        <AppearColorText color={color} easing={easing} progress={progress}>
          {children}
        </AppearColorText>
      )}
    </InheritedText>
  );
};
