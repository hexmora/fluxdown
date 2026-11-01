import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { ParagraphRenderPlugin } from './render';
import { ParagraphSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const ParagraphPlugin: IPluginItem = {
  slots: [ParagraphSlotPlugin],
  renders: [ParagraphRenderPlugin],
};
