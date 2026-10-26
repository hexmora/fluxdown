import { TablePlugin as _TablePlugin } from '@fluxdown/react-base-plugins/plugins/table';

import { pluginExtends } from '../../base';
import { TableCellSlotPlugin, TableSlotPlugin } from './slot';

export * from './slot';

export const TablePlugin = /*#__PURE__*/ pluginExtends(_TablePlugin, {
  slots: [TableSlotPlugin, TableCellSlotPlugin],
});
