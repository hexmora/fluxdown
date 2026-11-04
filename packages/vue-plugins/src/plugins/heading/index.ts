import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { HeadingPlugin as _HeadingPlugin } from '@fluxdown/vue-base-plugins/plugins/heading';

import { HeadingSlotPlugin } from './slot';

export * from './slot';

export const HeadingPlugin = /*#__PURE__*/ pluginExtends(_HeadingPlugin, {
  slots: [HeadingSlotPlugin],
});
