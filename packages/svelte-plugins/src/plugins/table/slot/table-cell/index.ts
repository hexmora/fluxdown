import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TableCellRenderer } from './table-cell-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-table-cell': IPluggableConfig<void>;
  }
}

export class TableCellSlotPlugin extends BaseSlotPlugin<'TableCell'> {
  static readonly key = 'slot-table-cell';

  readonly Component = TableCellRenderer;

  readonly type = 'TableCell';
}
