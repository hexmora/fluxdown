import type { CSSProperties } from 'react';

import cn from 'classnames';
import { useMemo } from 'react';

import type { ShadRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ShadRenderer = ({ children, start, duration }: ShadRendererProps) => {
  // Negative delay resumes the original fade when reparsing remounts an inline element, so
  // each character keeps its own clock instead of following the reveal position.
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - performance.now()) : 0), [start]);

  const active = start >= 0 && delay > -duration;

  const style = {
    [`--${PREFIX}-shad-duration`]: `${duration}ms`,
    animationDelay: `${delay}ms`,
  } as CSSProperties;

  return (
    <span
      className={cn(styles.root, active && styles.active)}
      data-fluxdown-shad="fade"
      key={start}
      style={style}
    >
      {children}
    </span>
  );
};
