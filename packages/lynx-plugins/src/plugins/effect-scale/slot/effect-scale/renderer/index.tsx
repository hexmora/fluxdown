import type { ReactNode } from '@lynx-js/react';

import { useMemo } from '@lynx-js/react';

import type { ScaleProps } from '../../../../../base';

import { AnimatedText, joinClassNames, useTextStyle } from '../../../../../base';
import { getAppearKeyframes, useScaleAnimation } from './animation';
import './style.scss';

export type ScaleRendererProps = Omit<ScaleProps, 'Raw'> & { Raw?: ScaleProps['Raw'] };

const isTextOnly = (children: ReactNode): boolean =>
  Array.isArray(children)
    ? children.every(isTextOnly)
    : children === null ||
      children === undefined ||
      typeof children === 'string' ||
      typeof children === 'number' ||
      typeof children === 'boolean';

export const ScaleRenderer = ({
  Raw: _Raw,
  children,
  start,
  duration,
  from,
  blur,
  className,
  style,
  ...elementProps
}: ScaleRendererProps) => {
  const textStyle = useTextStyle(style);

  const appear = useMemo(
    () => getAppearKeyframes(blur, textStyle.fontSize),
    [blur, textStyle.fontSize],
  );

  const grow = useMemo(() => [{ transform: `scale(${from})` }, { transform: 'scale(1)' }], [from]);

  const appearRef = useScaleAnimation(appear, start, duration, 'linear');

  const growRef = useScaleAnimation(
    grow,
    start,
    duration,
    'cubic-bezier(0.333333, 1, 0.666667, 1)',
  );

  return (
    <view
      {...elementProps}
      className={joinClassNames('fluxdown-scale', className)}
      key={start}
      main-thread:ref={appearRef}
      style={textStyle}
    >
      <view className="fluxdown-scale-glyph" main-thread:ref={growRef} style={textStyle}>
        <AnimatedText measureLayout={!isTextOnly(children)} style={textStyle}>
          {children}
        </AnimatedText>
      </view>
    </view>
  );
};
