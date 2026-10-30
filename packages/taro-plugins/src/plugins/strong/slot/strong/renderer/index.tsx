import { Text } from '@tarojs/components';
import cn from 'classnames';

import type { StrongProps } from '../../../../../base';

import styles from './index.module.scss';

export const StrongRenderer = ({ Raw: _Raw, ...props }: StrongProps) => {
  const {
    children,
    className,
    current: _current,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  return (
    <Text {...elementProps} data-tag="strong" className={cn(styles.root, className)}>
      {children}
    </Text>
  );
};
