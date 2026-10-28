import type { ScaleWordRendererProps } from './type';

import styles from './index.module.scss';

export const ScaleWordRenderer = ({ children }: ScaleWordRendererProps) => {
  return <span class={styles.word}>{children}</span>;
};
