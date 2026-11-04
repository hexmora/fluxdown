import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { CodeRenderPlugin } from './render';
import { CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const CodePlugin: IPluginItem = {
  renders: [CodeRenderPlugin],

  slots: [CodeHeaderSlotPlugin, CodeBlockSlotPlugin, CodeHighlighterSlotPlugin],
};
