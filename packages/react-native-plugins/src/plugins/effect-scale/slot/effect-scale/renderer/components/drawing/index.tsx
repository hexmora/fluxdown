import type { ReactNode } from 'react';
import type { LayoutRectangle } from 'react-native';
import type { FeGaussianBlurProps } from 'react-native-svg';

import { Component, useId, useMemo } from 'react';
import { Animated } from 'react-native';
import Svg, { Defs, FeGaussianBlur, Filter, ForeignObject, G } from 'react-native-svg';

import { BLUR, EASE_OUT, STEPS } from '../../consts';

// Keep the public SVG prop conversions on every animation frame.
class Blur extends Component<FeGaussianBlurProps> {
  render() {
    return <FeGaussianBlur {...this.props} />;
  }
}

const AnimatedBlur = /*#__PURE__*/ Animated.createAnimatedComponent(Blur);

type DrawingProps = {
  children: ReactNode;
  layout: LayoutRectangle;
  progress: Animated.Value;
  opacity: Animated.AnimatedInterpolation<number>;
  from: number;
  radius: number;
};

export const Drawing = ({ children, layout, progress, opacity, from, radius }: DrawingProps) => {
  const id = useId();

  const { width, height } = layout;

  const padding = Math.ceil(radius * 3);

  const scale = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [from, 1],
        easing: EASE_OUT,
      }),
    [from, progress],
  );

  const deviation = useMemo(
    () => Animated.multiply(progress.interpolate({ inputRange: STEPS, outputRange: BLUR }), radius),
    [progress, radius],
  );

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -padding,
        top: -padding,
        width: width + padding * 2,
        height: height + padding * 2,
        opacity,
      }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Svg width={width + padding * 2} height={height + padding * 2}>
        <Defs>
          <Filter
            id={id}
            filterUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={width + padding * 2}
            height={height + padding * 2}
          >
            <AnimatedBlur stdDeviation={deviation} />
          </Filter>
        </Defs>
        <G filter={`url(#${id})`}>
          <ForeignObject x={padding} y={padding} width={width + 1} height={height + 1}>
            <Animated.View
              style={{
                width,
                height,
                transform: [{ scale }],
                transformOrigin: [width / 2, height, 0],
              }}
            >
              {children}
            </Animated.View>
          </ForeignObject>
        </G>
      </Svg>
    </Animated.View>
  );
};
