import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { BreakLineRenderPlugin } from './render';
import { BreakLineSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const BreakLinePlugin: IPluginItem = {
  slots: [BreakLineSlotPlugin],
  renders: [BreakLineRenderPlugin],
};
