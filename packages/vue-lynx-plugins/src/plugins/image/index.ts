import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { ImagePlugin as _ImagePlugin } from '@fluxdown/vue-base-plugins/plugins/image';

import { ImageSlotPlugin } from './slot';

export * from './slot';

export const ImagePlugin = /*#__PURE__*/ pluginExtends(_ImagePlugin, {
  slots: [ImageSlotPlugin],
});
