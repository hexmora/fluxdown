import type { IPluginItem } from '../../typings';

import { BlockquoteRenderPlugin } from './render';
import { BlockquoteSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const BlockquotePlugin: IPluginItem = {
  slots: [BlockquoteSlotPlugin],
  renders: [BlockquoteRenderPlugin],
};
