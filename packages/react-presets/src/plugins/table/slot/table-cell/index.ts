import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';

import { TableCellRenderer } from './renderer';

declare global {
  interface SlotConfigs {
    'slot-table-cell': IPluggableConfig<void>;
  }
}

export class TableCellSlotPlugin extends BaseSlotPlugin<'TableCell'> {
  static readonly key = 'slot-table-cell';

  readonly Component = TableCellRenderer;

  readonly type = 'TableCell';
}
