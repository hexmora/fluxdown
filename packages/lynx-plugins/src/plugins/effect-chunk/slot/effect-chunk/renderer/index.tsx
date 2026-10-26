import type { CSSProperties } from '@lynx-js/types';

import { getTime } from '@fluxdown/utils';
import { useMemo } from '@lynx-js/react';

import type { ChunkProps } from '../../../../../base';

import { joinClassNames, TextAnimationProvider, useTextStyle } from '../../../../../base';
import './style.css';

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

  const animationStyle: CSSProperties | null = active
    ? {
        animationName: 'fluxdown-chunk-appear',
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationTimingFunction: 'cubic-bezier(0, 0, 0.58, 1)',
        animationFillMode: 'both',
      }
    : null;

  return (
    <TextAnimationProvider value={animationStyle}>
      <text
        {...elementProps}
        className={joinClassNames(
          active ? 'fluxdown-chunk fluxdown-chunk-active' : 'fluxdown-chunk',
          className,
        )}
        key={start}
        style={
          {
            ...textStyle,
            ...animationStyle,
            '--fluxdown-text-color': textStyle.color,
          } as CSSProperties
        }
      >
        {children}
      </text>
    </TextAnimationProvider>
  );
};
