import cn from 'classnames';

import type { SuffixRendererProps } from './type';

import styles from './index.module.scss';

export * from './type';

export const SuffixRenderer = (props: SuffixRendererProps) => {
  const markerClass = () => {
    if (props.type === 'cursor') {
      return styles.cursor;
    }

    if (props.type === 'dot') {
      return styles.dot;
    }

    return styles.custom;
  };

  return (
    <span aria-hidden={true} class={styles.root} data-fluxdown-suffix={props.type}>
      <span class={cn(styles.marker, markerClass())}>{props.children}</span>
    </span>
  );
};
