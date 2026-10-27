import type { ShadRendererProps } from './type';

import styles from './index.module.scss';

export const ShadRenderer = ({ active, isActive, leading, maskWidth }: ShadRendererProps) => {
  return (
    <span class={styles.root}>
      <span class={styles.leading}>{leading}</span>
      <span class={styles.active}>{active}</span>
      <span
        aria-hidden={true}
        class={isActive ? styles.mask : styles.maskHidden}
        style={{ width: `${maskWidth}px`, marginLeft: `${-maskWidth}px` }}
      />
    </span>
  );
};
