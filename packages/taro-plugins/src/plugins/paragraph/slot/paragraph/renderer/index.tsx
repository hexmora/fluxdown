import { View } from '@tarojs/components';
import cn from 'classnames';

import type { ParagraphProps } from '../../../../../base';

import styles from './index.module.scss';

export const ParagraphRenderer = ({ Raw: _Raw, ...props }: ParagraphProps) => {
  const {
    children,
    className,
    current: _current,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  return (
    <View data-tag="p" {...elementProps} className={cn(styles.root, className)}>
      {children}
    </View>
  );
};
