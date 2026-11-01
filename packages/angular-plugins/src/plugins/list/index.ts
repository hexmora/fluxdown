import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { ListRenderPlugin } from './render';
import { ListSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const ListPlugin: IPluginItem = {
  slots: [ListSlotPlugin],
  renders: [ListRenderPlugin],
};
