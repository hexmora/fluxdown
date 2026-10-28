import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { TableProps } from '../../../../../base';

import styles from './index.module.scss';

export const TableRenderer = (props: TableProps) => {
  const [local, elementProps] = splitProps(props, ['Raw', 'children', 'class']);

  return (
    <div {...elementProps} class={cn(styles.root, local.class)}>
      <table>{local.children}</table>
    </div>
  );
};
