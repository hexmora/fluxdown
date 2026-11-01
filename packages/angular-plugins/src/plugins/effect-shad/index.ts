import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { EffectShadRenderPlugin } from './render';
import { EffectShadSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectShadPlugin: IPluginItem = {
  slots: [EffectShadSlotPlugin],
  renders: [EffectShadRenderPlugin],
};
