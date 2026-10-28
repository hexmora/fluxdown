import { Text } from '@tarojs/components';

import type { ScaleWordRendererProps } from './type';

import styles from './index.module.scss';

export const ScaleWordRenderer = ({ children }: ScaleWordRendererProps) => {
  return <Text className={styles.word}>{children}</Text>;
};
