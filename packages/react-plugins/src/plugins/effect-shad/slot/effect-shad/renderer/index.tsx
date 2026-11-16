import cn from 'classnames';

import type { ShadMaskStyle, ShadRendererProps } from './type';

import styles from './index.module.scss';

export const ShadRenderer = ({ active, isActive, leading, maskWidth }: ShadRendererProps) => {
  const maskStyle: ShadMaskStyle = { '--mask-width': `${maskWidth}px` };

  return (
    <span className={styles.root}>
      <span className={styles.leading}>{leading}</span>
      <span className={cn(styles.active, isActive && styles.mask)} style={maskStyle}>
        {active}
      </span>
    </span>
  );
};
