import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { HeadingRenderPlugin } from './render';
import { HeadingSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const HeadingPlugin: IPluginItem = {
  slots: [HeadingSlotPlugin],
  renders: [HeadingRenderPlugin],
};
