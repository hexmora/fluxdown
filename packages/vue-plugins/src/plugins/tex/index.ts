import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { TexPlugin as _TexPlugin } from '@fluxdown/vue-base-plugins/plugins/tex';

import { TexSlotPlugin } from './slot';

export * from './slot';

export const TexPlugin = /*#__PURE__*/ pluginExtends(_TexPlugin, {
  slots: [TexSlotPlugin],
});
