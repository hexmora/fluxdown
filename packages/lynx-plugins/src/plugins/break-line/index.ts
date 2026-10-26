import type { IPluginItem } from '../../typings';

import { BreakLineRenderPlugin } from './render';
import { BreakLineSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const BreakLinePlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [BreakLineRenderPlugin],

      slots: [BreakLineSlotPlugin],
    }
  : {};
