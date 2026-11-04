import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { CodeRenderPlugin } from './render';
import { CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const CodePlugin: IPluginItem = {
  slots: [CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin],
  renders: [CodeRenderPlugin],
};
