import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { EffectSuffixRenderPlugin } from './render';
import { EffectSuffixSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectSuffixPlugin: IPluginItem = {
  slots: [EffectSuffixSlotPlugin],
  renders: [EffectSuffixRenderPlugin],
};
