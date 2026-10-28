import cn from 'classnames';

import type { SuffixRendererProps } from './type';

import styles from './index.module.scss';

export * from './type';

export const SuffixRenderer = ({ children, type }: SuffixRendererProps) => {
  return (
    <span aria-hidden={true} class={styles.root} data-fluxdown-suffix={type}>
      <span
        class={cn(
          styles.marker,
          type === 'cursor' ? styles.cursor : type === 'dot' ? styles.dot : styles.custom,
        )}
      >
        {children}
      </span>
    </span>
  );
};
