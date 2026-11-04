import type { IPluginItem } from '../../typings';

import { PatchRenderPlugin } from './render';

export * from './render';

export const PatchPlugin: IPluginItem = {
  renders: [PatchRenderPlugin],
};
