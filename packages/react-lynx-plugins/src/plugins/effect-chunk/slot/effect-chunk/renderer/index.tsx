import { getTime } from '@fluxdown/utils';
import { useMemo } from '@lynx-js/react';

import type { ChunkProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextAnimationProvider,
  useTextStyle,
} from '../../../../../base';
import './style.scss';

export type ChunkRendererProps = Omit<ChunkProps, 'Raw'> & { Raw?: ChunkProps['Raw'] };

export const ChunkRenderer = ({
  Raw: _Raw,
  children,
  start,
  duration,
  className,
  style,
  ...elementProps
}: ChunkRendererProps) => {
  const textStyle = useTextStyle(style);

  // Keep the original delay during updates, but resume at the current time after a remount.
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - getTime()) : 0), [start]);

  const active = start >= 0 && delay > -duration;

  const animation = useMemo(
    () => (start >= 0 ? { arrival: Date.now() + start - getTime(), duration } : null),
    [start, duration],
  );

  return (
    <TextAnimationProvider value={animation}>
      <AnimatedText
        {...elementProps}
        className={joinClassNames(
          active ? 'fluxdown-chunk fluxdown-chunk-active' : 'fluxdown-chunk',
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
