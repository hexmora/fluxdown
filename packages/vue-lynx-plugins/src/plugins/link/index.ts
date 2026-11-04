import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { LinkPlugin as _LinkPlugin } from '@fluxdown/vue-base-plugins/plugins/link';

import { LinkSlotPlugin } from './slot';

export * from './slot';

export const LinkPlugin = /*#__PURE__*/ pluginExtends(_LinkPlugin, {
  slots: [LinkSlotPlugin],
});
