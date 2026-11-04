import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { FallbackRenderPlugin } from './render';
import { ElementSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const FallbackPlugin: IPluginItem = {
  renders: [FallbackRenderPlugin],

  slots: [ElementSlotPlugin],
};
