import type { IPluginItem } from '../../typings';

import { ImageRenderPlugin } from './render';

export * from './render';

export const ImagePlugin: IPluginItem = {
  renders: [ImageRenderPlugin],
};
