import { BlockquoteRenderPlugin } from '@fluxdown/react-base-presets/plugins/blockquote';

import type { IPluginItem } from '../../typings';

import { BlockquoteSlotPlugin } from '../../slot/blockquote';

export { BlockquoteRenderPlugin } from '@fluxdown/react-base-presets/plugins/blockquote';
export { BlockquoteSlotPlugin } from '../../slot/blockquote';

export const BlockquotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};
