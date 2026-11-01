import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { EmphasisRenderPlugin } from './render';
import { EmphasisSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EmphasisPlugin: IPluginItem = {
  slots: [EmphasisSlotPlugin],
  renders: [EmphasisRenderPlugin],
};
