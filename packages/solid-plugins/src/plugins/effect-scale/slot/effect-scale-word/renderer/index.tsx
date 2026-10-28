import type { ScaleWordRendererProps } from './type';

import styles from './index.module.scss';

export const ScaleWordRenderer = (props: ScaleWordRendererProps) => {
  return <span class={styles.word}>{props.children}</span>;
};
