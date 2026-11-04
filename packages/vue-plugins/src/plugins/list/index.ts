import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { ListPlugin as _ListPlugin } from '@fluxdown/vue-base-plugins/plugins/list';

import { ListSlotPlugin } from './slot';

export * from './slot';

export const ListPlugin = /*#__PURE__*/ pluginExtends(_ListPlugin, {
  slots: [ListSlotPlugin],
});
