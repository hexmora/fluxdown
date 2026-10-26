import type { CSSProperties } from '@lynx-js/types';

import { getTime } from '@fluxdown/utils';
import { useMemo } from '@lynx-js/react';

import type { ScaleProps } from '../../../../../base';

import { joinClassNames, useTextStyle } from '../../../../../base';
import './style.css';

export type ScaleRendererProps = Omit<ScaleProps, 'Raw'> & { Raw?: ScaleProps['Raw'] };

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

  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - getTime()) : 0), [start]);

  const active = start >= 0 && delay > -duration;

  const animationStyle: CSSProperties = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  return (
    <view
      {...elementProps}
      className={joinClassNames(
        active ? 'fluxdown-scale fluxdown-scale-active' : 'fluxdown-scale',
        className,
      )}
      key={start}
      style={
        { ...textStyle, ...animationStyle, '--fluxdown-scale-blur': `${blur}em` } as CSSProperties
      }
    >
      <view
        className={active ? 'fluxdown-scale-glyph fluxdown-scale-grow' : 'fluxdown-scale-glyph'}
        style={{ ...textStyle, ...animationStyle, '--fluxdown-scale-from': from } as CSSProperties}
      >
        <text style={textStyle}>{children}</text>
      </view>
    </view>
  );
};
