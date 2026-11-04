import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { BlockquotePlugin as _BlockquotePlugin } from '@fluxdown/vue-base-plugins/plugins/blockquote';

import { BlockquoteSlotPlugin } from './slot';

export * from './slot';

export const BlockquotePlugin = /*#__PURE__*/ pluginExtends(_BlockquotePlugin, {
  slots: [BlockquoteSlotPlugin],
});
