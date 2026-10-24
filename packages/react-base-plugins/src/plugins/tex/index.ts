import type { IPluginItem } from '../../typings';

import { TexRenderPlugin } from './render';

export * from './render';

export const TexPlugin: IPluginItem = {
  renders: [TexRenderPlugin],
};
