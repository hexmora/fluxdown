import type { IPluginItem } from '../../typings';

import { StrongRenderPlugin } from './render';
import { StrongSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const StrongPlugin: IPluginItem = {
  renders: [StrongRenderPlugin],
  slots: [StrongSlotPlugin],
};
