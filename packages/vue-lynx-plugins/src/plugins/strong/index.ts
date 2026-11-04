import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { StrongPlugin as _StrongPlugin } from '@fluxdown/vue-base-plugins/plugins/strong';

import { StrongSlotPlugin } from './slot';

export * from './slot';

export const StrongPlugin = /*#__PURE__*/ pluginExtends(_StrongPlugin, {
  slots: [StrongSlotPlugin],
});
