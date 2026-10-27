import { ImagePlugin as _ImagePlugin } from '@fluxdown/react-base-plugins/plugins/image';

import { pluginExtends } from '../../base';
import { ImageSlotPlugin } from './slot';

export * from './slot';

export const ImagePlugin = /*#__PURE__*/ pluginExtends(_ImagePlugin, {
  slots: [ImageSlotPlugin],
});
