import { View } from '@tarojs/components';
import cn from 'classnames';

import type { ListProps } from '../../../../../base';

import styles from './index.module.scss';

export const ListRenderer = ({ Raw: _Raw, ...props }: ListProps) => {
  const {
    children,
    className,
    current,
    parents: _parents,
    render: _render,
    type,
    ...elementProps
  } = props;

  const start = current.type === 'element' ? Number(current.properties.start ?? 1) : 1;

  return (
    <View
      {...elementProps}
      className={cn(styles.root, className)}
      data-tag={type === 'ordered' ? 'ol' : 'ul'}
      style={{ ...props.style, counterReset: `fluxdown-list ${start - 1}` }}
    >
      {children}
    </View>
  );
};
