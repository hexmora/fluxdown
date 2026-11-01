import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { ImageRenderPlugin } from './render';
import { ImageSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const ImagePlugin: IPluginItem = {
  slots: [ImageSlotPlugin],
  renders: [ImageRenderPlugin],
};
