import cn from 'classnames';

import type { ParagraphProps } from '../../../../../base';

import styles from './index.module.scss';

export const ParagraphRenderer = ({ Raw: _Raw, ...props }: ParagraphProps) => {
  const {
    children,
    class: className,
    current: _current,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  return (
    <p {...elementProps} class={cn(styles.root, className)}>
      {children}
    </p>
  );
};

ParagraphRenderer.inheritAttrs = false;
