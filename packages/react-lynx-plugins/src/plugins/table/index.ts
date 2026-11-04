import type { IPluginItem } from '../../typings';

import { TableCellRenderPlugin, TableRenderPlugin } from './render';
import { TableCellSlotPlugin, TableSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const TablePlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [TableRenderPlugin, TableCellRenderPlugin],

      slots: [TableSlotPlugin, TableCellSlotPlugin],
    }
  : {};
