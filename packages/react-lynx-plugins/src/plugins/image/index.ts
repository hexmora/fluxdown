import type { IPluginItem } from '../../typings';

import { ImageRenderPlugin } from './render';
import { ImageSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const ImagePlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [ImageRenderPlugin],

      slots: [ImageSlotPlugin],
    }
  : {};
