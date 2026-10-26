import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';

import { useMemo } from 'react';
import { Animated, processColor } from 'react-native';

import type { ChunkProps } from '../../../../../base';

import { InheritedText, useAppear } from '../../../../../base';
import { EASE_OUT } from './consts';

type ChunkTextProps = {
  children?: ReactNode;
  color: ColorValue;
  progress: Animated.Value;
};

const ChunkText = ({ children, color, progress }: ChunkTextProps) => {
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
      easing: EASE_OUT,
    });
  }, [color, progress]);

  return <Animated.Text style={{ color: animatedColor }}>{children}</Animated.Text>;
};

export const ChunkRenderer = ({ children, duration, start }: ChunkProps) => {
  const { progress } = useAppear(start, duration);

  return (
    <InheritedText>
      {({ color = 'black' }) => {
        return (
          <ChunkText color={color} progress={progress}>
            {children}
          </ChunkText>
        );
      }}
    </InheritedText>
  );
};
