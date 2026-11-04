import { getTime } from '@fluxdown/utils';
import { useMemo } from '@lynx-js/react';

import type { ShadProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextAnimationProvider,
  useTextStyle,
} from '../../../../../base';
import './style.scss';

export type ShadRendererProps = Omit<ShadProps, 'Raw'> & { Raw?: ShadProps['Raw'] };

export const ShadRenderer = ({
  Raw: _Raw,
  children,
  start,
  duration,
  className,
  style,
  ...elementProps
}: ShadRendererProps) => {
  const textStyle = useTextStyle(style);

  // Keep the original delay during updates, but resume at the current time after a remount.
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - getTime()) : 0), [start]);

  const active = start >= 0 && delay > -duration;

  // Linear alpha over time reads as an even gradient across the tail at a steady pace.
  const animation = useMemo(
    () =>
      start >= 0 ? { arrival: Date.now() + start - getTime(), duration, easing: 'linear' } : null,
    [start, duration],
  );

  return (
    <TextAnimationProvider value={animation}>
      <AnimatedText
        {...elementProps}
        className={joinClassNames(
          active ? 'fluxdown-shad fluxdown-shad-active' : 'fluxdown-shad',
          className,
        )}
        key={start}
        style={textStyle}
      >
        {children}
      </AnimatedText>
    </TextAnimationProvider>
  );
};
