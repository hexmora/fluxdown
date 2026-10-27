import cn from 'classnames';
import { h } from 'vue';

import type { ListProps } from '../../../../../base';

import styles from './index.module.scss';

export const ListRenderer = ({ Raw: _Raw, ...props }: ListProps) => {
  const {
    children,
    class: className,
    current: _current,
    parents: _parents,
    render: _render,
    type,
    ...elementProps
  } = props;

  return h(
    type === 'ordered' ? 'ol' : 'ul',
    { ...elementProps, class: cn(styles.root, className) },
    [children],
  );
};

ListRenderer.inheritAttrs = false;
