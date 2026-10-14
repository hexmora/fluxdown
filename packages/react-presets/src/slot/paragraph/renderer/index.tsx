import cn from 'classnames';

import type { ParagraphProps } from '../../../base';

import { getReactProps } from '../../../base';
import styles from './index.module.scss';

export const ParagraphRenderer = ({ Raw: _Raw, ...props }: ParagraphProps) => {
  const {
    children,
    className,
    current: _current,
    parents: _parents,
    render: _render,
    ...elementProps
  } = { ...getReactProps(props.current), ...props };

  return (
    <p {...elementProps} className={cn(styles.root, className)}>
      {children}
    </p>
  );
};
