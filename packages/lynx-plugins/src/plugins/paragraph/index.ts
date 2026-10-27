import type { IPluginItem } from '../../typings';

import { ParagraphRenderPlugin } from './render';
import { ParagraphSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const ParagraphPlugin: IPluginItem = __BACKGROUND__
  ? {
      renders: [ParagraphRenderPlugin],

      slots: [ParagraphSlotPlugin],
    }
  : {};
