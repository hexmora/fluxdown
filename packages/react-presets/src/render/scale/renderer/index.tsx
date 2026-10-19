import type { CSSProperties } from 'react';

import cn from 'classnames';
import { useMemo } from 'react';

import type { ScaleRendererProps, ScaleWordRendererProps } from './type';

import { PREFIX } from '../../../base';
import styles from './index.module.scss';

export const ScaleWordRenderer = ({ children }: ScaleWordRendererProps) => {
  return <span className={styles.word}>{children}</span>;
};

export const ScaleRenderer = ({ children, start, duration, from, blur }: ScaleRendererProps) => {
  const delay = useMemo(() => (start > 0 ? Math.min(0, start - Date.now()) : 0), [start]);

  const active = start > 0 && delay > -duration;

  const style = {
    [`--${PREFIX}-scale-duration`]: `${duration}ms`,
    [`--${PREFIX}-scale-from`]: from,
    [`--${PREFIX}-scale-blur`]: `${blur}em`,
    animationDelay: `${delay}ms`,
  } as CSSProperties;

  return (
    <span className={cn(styles.root, active && styles.active)} key={start} style={style}>
      <span className={styles.glyph}>{children}</span>
    </span>
  );
};
