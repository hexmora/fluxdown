import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { LinkRenderPlugin } from './render';
import { LinkSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const LinkPlugin: IPluginItem = {
  slots: [LinkSlotPlugin],
  renders: [LinkRenderPlugin],
};
