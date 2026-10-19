import cn from 'classnames';

import type { SuffixRendererProps } from './type';

import styles from './index.module.scss';

export * from './type';

export const SuffixRenderer = ({ children, type }: SuffixRendererProps) => (
  <span aria-hidden={true} className={styles.root} data-fluxdown-suffix={type}>
    <span
      className={cn(
        styles.marker,
        type === 'cursor' ? styles.cursor : type === 'dot' ? styles.dot : styles.custom,
      )}
    >
      {children}
    </span>
  </span>
);
