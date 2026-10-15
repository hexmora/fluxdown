import cn from 'classnames';

import type { TableProps } from '../../../base';

import { getReactProps } from '../../../base';
import styles from './index.module.scss';

export const TableRenderer = ({ Raw: _Raw, ...props }: TableProps) => {
  const {
    children,
    className,
    current: _current,
    ...elementProps
  } = {
    ...getReactProps(props.current),
    ...props,
  };

  return (
    <div {...elementProps} className={cn(styles.root, className)}>
      <table>{children}</table>
    </div>
  );
};
