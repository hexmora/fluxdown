import cn from 'classnames';

import type { ShadRendererProps } from './type';

import styles from './index.module.scss';

export const ShadRenderer = ({ active, isActive, leading, maskWidth }: ShadRendererProps) => {
  const maskImage = `linear-gradient(to right, #000, transparent), linear-gradient(to right, #000 max(0px, calc(100% - ${maskWidth}px)), transparent)`;

  return (
    <span className={styles.root}>
      <span className={styles.leading}>{leading}</span>
      <span
        className={cn(styles.active, isActive && styles.mask)}
        style={isActive ? { maskImage } : undefined}
      >
        {active}
      </span>
    </span>
  );
};
