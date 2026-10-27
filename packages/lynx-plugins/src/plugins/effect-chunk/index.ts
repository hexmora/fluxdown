import type { IPluginItem } from '../../typings';

import { EffectChunkRenderPlugin } from './render';
import { EffectChunkSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectChunkPlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [EffectChunkRenderPlugin],

      slots: [EffectChunkSlotPlugin],
    }
  : {};
