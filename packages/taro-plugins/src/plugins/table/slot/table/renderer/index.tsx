import { View } from '@tarojs/components';
import cn from 'classnames';

import type { TableProps } from '../../../../../base';

import styles from './index.module.scss';

export const TableRenderer = ({ Raw: _Raw, ...props }: TableProps) => {
  const { children, className, ...elementProps } = props;

  return (
    <View {...elementProps} className={cn(styles.root, className)}>
      <View data-tag="table">{children}</View>
    </View>
  );
};
