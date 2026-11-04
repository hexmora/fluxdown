import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { EmphasisPlugin as _EmphasisPlugin } from '@fluxdown/vue-base-plugins/plugins/emphasis';

import { EmphasisSlotPlugin } from './slot';

export * from './slot';

export const EmphasisPlugin = /*#__PURE__*/ pluginExtends(_EmphasisPlugin, {
  slots: [EmphasisSlotPlugin],
});
