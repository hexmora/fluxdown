import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { EffectShadRenderPlugin } from './render';
import { EffectShadSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectShadPlugin: IPluginItem = {
  renders: [EffectShadRenderPlugin],

  slots: [EffectShadSlotPlugin],
};
