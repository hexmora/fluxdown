import type { IPluginItem } from '../../typings';

import { CodeRenderPlugin } from './render';
import { CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const CodePlugin: IPluginItem = {
  renders: [CodeRenderPlugin],
  slots: [CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin],
};
