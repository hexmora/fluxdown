import type { IPluginItem } from '../../typings';

import { FallbackRenderPlugin } from './render';
import { ElementSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const FallbackPlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [FallbackRenderPlugin],

      slots: [ElementSlotPlugin],
    }
  : {};
