import { View } from '@tarojs/components';
import cn from 'classnames';

import type { BlockquoteProps } from '../../../../../base';

import { TextColorProvider, useTextColor } from '../../../../../base';
import styles from './index.module.scss';

export const BlockquoteRenderer = ({ Raw: _Raw, ...props }: BlockquoteProps) => {
  const {
    children,
    className,
    current: _current,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  const color = useTextColor('muted');

  return (
    <View {...elementProps} data-tag="blockquote" className={cn(styles.root, className)}>
      <TextColorProvider value={elementProps.style?.color ?? color}>{children}</TextColorProvider>
    </View>
  );
};
