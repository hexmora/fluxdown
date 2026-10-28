import type { CSSProperties } from 'react';

import { getTime } from '@fluxdown/utils';
import { Text } from '@tarojs/components';
import cn from 'classnames';
import { useMemo } from 'react';

import type { ChunkRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ChunkRenderer = ({ children, start, duration }: ChunkRendererProps) => {
  // Negative delay resumes the original batch when reparsing remounts an inline element.
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - getTime()) : 0), [start]);

  const active = start >= 0 && delay > -duration;

  const style = {
    [`--${PREFIX}-chunk-duration`]: `${duration}ms`,
    animationDelay: `${delay}ms`,
  } as CSSProperties;

  return (
    <Text
      className={cn(styles.root, active && styles.active)}
      data-fluxdown-chunk="1"
      key={start}
      style={style}
    >
      {children}
    </Text>
  );
};
