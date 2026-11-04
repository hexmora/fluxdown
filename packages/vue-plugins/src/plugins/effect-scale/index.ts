import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { EffectScaleRenderPlugin } from './render';
import { EffectScaleSlotPlugin, EffectScaleWordSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EffectScalePlugin: IPluginItem = {
  slots: [EffectScaleSlotPlugin, EffectScaleWordSlotPlugin],
  renders: [EffectScaleRenderPlugin],
};
