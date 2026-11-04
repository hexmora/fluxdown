import type { IPluginItem } from '../../typings';

import { EffectSuffixRenderPlugin } from './render';
import { EffectSuffixSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectSuffixPlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [EffectSuffixRenderPlugin],

      slots: [EffectSuffixSlotPlugin],
    }
  : {};
