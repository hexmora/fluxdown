import { Text } from '@tarojs/components';

import type { ShadRendererProps } from './type';

import styles from './index.module.scss';

export const ShadRenderer = ({ active, isActive, leading, maskWidth }: ShadRendererProps) => {
  return (
    <Text className={styles.root}>
      <Text className={styles.leading}>{leading}</Text>
      <Text className={styles.active}>{active}</Text>
      <Text
        aria-hidden={true}
        className={isActive ? styles.mask : styles.maskHidden}
        style={{ width: maskWidth, marginLeft: -maskWidth }}
      />
    </Text>
  );
};
