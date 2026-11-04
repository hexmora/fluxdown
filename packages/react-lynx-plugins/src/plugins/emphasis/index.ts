import type { IPluginItem } from '../../typings';

import { EmphasisRenderPlugin } from './render';
import { EmphasisSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const EmphasisPlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [EmphasisRenderPlugin],

      slots: [EmphasisSlotPlugin],
    }
  : {};
