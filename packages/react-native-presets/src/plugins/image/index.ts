import { ImageRenderPlugin } from '@fluxdown/react-base-presets/plugins/image';

import type { IPluginItem } from '../../typings';

import { ImageSlotPlugin } from '../../slot/image';

export { ImageRenderPlugin } from '@fluxdown/react-base-presets/plugins/image';
export { ImageSlotPlugin } from '../../slot/image';

export const ImagePlugin: IPluginItem = {
  renders: [ImageRenderPlugin],
  slots: [ImageSlotPlugin],
};
