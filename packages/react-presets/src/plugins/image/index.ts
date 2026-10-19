import type { IPluginItem } from '../../typings';

import { ImageRenderPlugin } from './render';
import { ImageSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const ImagePlugin: IPluginItem = {
  renders: [ImageRenderPlugin],
  slots: [ImageSlotPlugin],
};
