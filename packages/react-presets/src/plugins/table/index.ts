import type { IPluginItem } from '../../typings';

import { TableCellRenderPlugin, TableRenderPlugin } from './render';
import { TableSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const TablePlugin: IPluginItem = {
  renders: [TableRenderPlugin, TableCellRenderPlugin],
  slots: [TableSlotPlugin],
};
