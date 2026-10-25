import type { IPluginItem } from '../../typings';

import { EffectShadRenderPlugin } from './render';

export * from './render';

export const EffectShadPlugin: IPluginItem = {
  renders: [EffectShadRenderPlugin],
};
