import type { IPluginItem } from '../../typings';

import { ParagraphRenderPlugin } from './render';

export * from './render';

export const ParagraphPlugin: IPluginItem = {
  renders: [ParagraphRenderPlugin],
};
