import type { TableCellProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { TableCellRenderer } from './renderer';

export class TableCellSlotPlugin extends BaseSlotPlugin<'TableCell'> {
  static readonly key = 'slot-table-cell';

  readonly Component = TableCellRenderer;

  readonly type = 'TableCell';

  readonly tagName = ({ tagName }: TableCellProps) => tagName;
}
