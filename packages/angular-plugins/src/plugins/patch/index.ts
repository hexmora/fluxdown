import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { PatchRenderPlugin } from './render';

export * from './render';

export const PatchPlugin: IPluginItem = {
  renders: [PatchRenderPlugin],
};
