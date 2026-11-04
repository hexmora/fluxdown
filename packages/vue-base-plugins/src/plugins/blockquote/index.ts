import type { IPluginItem } from '../../typings';

import { BlockquoteRenderPlugin } from './render';

export * from './render';

export const BlockquotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
};
