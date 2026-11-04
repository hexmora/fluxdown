import type { IPluginItem } from '../../typings';

import { EffectChunkRenderPlugin } from './render';

export * from './render';

export const EffectChunkPlugin: IPluginItem = {
  renders: [EffectChunkRenderPlugin],
};
