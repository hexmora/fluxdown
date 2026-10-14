import cn from 'classnames';
import { createElement } from 'react';

import type { ListProps } from '../../../base';

import { getReactProps } from '../../../base';
import styles from './index.module.scss';

export const ListRenderer = ({ Raw: _Raw, ...props }: ListProps) => {
  const {
    children,
    className,
    current: _current,
    parents: _parents,
    render: _render,
    type,
    ...elementProps
  } = { ...getReactProps(props.current), ...props };

  return createElement(
    type === 'ordered' ? 'ol' : 'ul',
    { ...elementProps, className: cn(styles.root, className) },
    children,
  );
};
