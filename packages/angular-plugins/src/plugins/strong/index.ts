import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { StrongRenderPlugin } from './render';
import { StrongSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const StrongPlugin: IPluginItem = {
  slots: [StrongSlotPlugin],
  renders: [StrongRenderPlugin],
};
