import { ListPlugin as _ListPlugin } from '@fluxdown/react-base-plugins/plugins/list';

import { pluginExtends } from '../../base';
import { ListSlotPlugin } from './slot';

export * from './slot';

export const ListPlugin = /*#__PURE__*/ pluginExtends(_ListPlugin, {
  slots: [ListSlotPlugin],
});
