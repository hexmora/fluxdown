import type { IPluginItem } from '../../typings';

import { TableCellRenderPlugin, TableRenderPlugin } from './render';

export * from './render';

export const TablePlugin: IPluginItem = {
  renders: [TableRenderPlugin, TableCellRenderPlugin],
};
