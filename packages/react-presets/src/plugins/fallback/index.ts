import type { IPluginItem } from '../../typings';

import { FallbackRenderPlugin } from './render';
import { NodeSlotPlugin } from './slot';
export * from './render';
export * from './slot';
export const FallbackPlugin: IPluginItem = {
  renders: [FallbackRenderPlugin],
  slots: [NodeSlotPlugin],
};
