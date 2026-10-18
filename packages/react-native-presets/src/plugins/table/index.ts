import {
  TableCellRenderPlugin,
  TableRenderPlugin,
} from '@fluxdown/react-base-presets/plugins/table';

import type { IPluginItem } from '../../typings';

import { TableSlotPlugin } from '../../slot/table';
import { TableCellSlotPlugin } from '../../slot/table-cell';

export {
  TableRenderPlugin,
  TableCellRenderPlugin,
} from '@fluxdown/react-base-presets/plugins/table';
export { TableSlotPlugin } from '../../slot/table';
export { TableCellSlotPlugin } from '../../slot/table-cell';

export const TablePlugin: IPluginItem = {
  renders: [TableRenderPlugin, TableCellRenderPlugin],
  slots: [TableSlotPlugin, TableCellSlotPlugin],
};
