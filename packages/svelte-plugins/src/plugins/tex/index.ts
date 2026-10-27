import type { IPluginItem } from '../../typings';

import { TexRenderPlugin } from './render';
import { TexSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const TexPlugin: IPluginItem = {
  slots: [TexSlotPlugin],
  renders: [TexRenderPlugin],
};
