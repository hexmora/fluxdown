import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { EffectChunkRenderPlugin } from './render';
import { EffectChunkSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectChunkPlugin: IPluginItem = {
  slots: [EffectChunkSlotPlugin],
  renders: [EffectChunkRenderPlugin],
};
