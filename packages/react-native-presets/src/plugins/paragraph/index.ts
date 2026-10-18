import { ParagraphRenderPlugin } from '@fluxdown/react-base-presets/plugins/paragraph';

import type { IPluginItem } from '../../typings';

import { ParagraphSlotPlugin } from '../../slot/paragraph';

export { ParagraphRenderPlugin } from '@fluxdown/react-base-presets/plugins/paragraph';
export { ParagraphSlotPlugin } from '../../slot/paragraph';

export const ParagraphPlugin: IPluginItem = {
  renders: [ParagraphRenderPlugin],
  slots: [ParagraphSlotPlugin],
};
