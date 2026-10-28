import type { JSX } from 'solid-js';

import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { TableCellProps } from '../../../../../base';

export const TableCellRenderer = (props: TableCellProps) => {
  const [local, elementProps] = splitProps(props, ['Raw', 'align', 'children', 'tagName']);

  return (
    <Dynamic
      component={local.tagName}
      {...elementProps}
      align={local.align as JSX.TdHTMLAttributes<HTMLTableCellElement>['align']}
    >
      {local.children}
    </Dynamic>
  );
};
