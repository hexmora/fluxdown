import type { CSSProperties } from 'react';

import { getTime } from '@fluxdown/utils';
import { Text } from '@tarojs/components';
import cn from 'classnames';
import { useMemo } from 'react';

import type { ScaleRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ScaleRenderer = ({ children, start, duration, from, blur }: ScaleRendererProps) => {
  const delay = useMemo(() => (start >= 0 ? Math.min(0, start - getTime()) : 0), [start]);

  const active = start >= 0 && delay > -duration;

  const style = {
    [`--${PREFIX}-scale-duration`]: `${duration}ms`,
    [`--${PREFIX}-scale-from`]: from,
    [`--${PREFIX}-scale-blur`]: `${blur}em`,
    animationDelay: `${delay}ms`,
  } as CSSProperties;

  return (
    <Text className={cn(styles.root, active && styles.active)} key={start} style={style}>
      <Text className={styles.glyph}>{children}</Text>
    </Text>
  );
};
