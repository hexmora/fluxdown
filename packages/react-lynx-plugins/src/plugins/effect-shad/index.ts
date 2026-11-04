import type { IPluginItem } from '../../typings';

import { EffectShadRenderPlugin } from './render';
import { EffectShadSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectShadPlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [EffectShadRenderPlugin],

      slots: [EffectShadSlotPlugin],
    }
  : {};
