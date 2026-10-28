import type { ShadRendererProps } from './type';

import styles from './index.module.scss';

export const ShadRenderer = (props: ShadRendererProps) => {
  return (
    <span class={styles.root}>
      <span class={styles.leading}>{props.leading}</span>
      <span class={styles.active}>{props.active}</span>
      <span
        aria-hidden={true}
        class={props.isActive ? styles.mask : styles.maskHidden}
        style={{ width: `${props.maskWidth}px`, 'margin-left': `${-props.maskWidth}px` }}
      />
    </span>
  );
};
