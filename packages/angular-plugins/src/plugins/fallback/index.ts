import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { FallbackRenderPlugin } from './render';
import { ElementSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const FallbackPlugin: IPluginItem = {
  slots: [ElementSlotPlugin],
  renders: [FallbackRenderPlugin],
};
