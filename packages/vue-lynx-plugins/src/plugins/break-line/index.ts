import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { BreakLinePlugin as _BreakLinePlugin } from '@fluxdown/vue-base-plugins/plugins/break-line';

import { BreakLineSlotPlugin } from './slot';

export * from './slot';

export const BreakLinePlugin = /*#__PURE__*/ pluginExtends(_BreakLinePlugin, {
  slots: [BreakLineSlotPlugin],
});
