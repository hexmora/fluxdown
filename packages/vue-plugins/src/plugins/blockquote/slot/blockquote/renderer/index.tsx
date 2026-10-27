import cn from 'classnames';

import type { BlockquoteProps } from '../../../../../base';

import styles from './index.module.scss';

export const BlockquoteRenderer = ({ Raw: _Raw, ...props }: BlockquoteProps) => {
  const {
    children,
    class: className,
    current: _current,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  return (
    <blockquote {...elementProps} class={cn(styles.root, className)}>
      {children}
    </blockquote>
  );
};

BlockquoteRenderer.inheritAttrs = false;
