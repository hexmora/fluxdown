import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { CodeRenderPlugin } from '@fluxdown/react-base-presets/plugins/code';

import type { IPluginItem } from '../../typings';

import { CodeBlockSlotPlugin } from '../../slot/code-block';
import { CodeHeaderSlotPlugin } from '../../slot/code-header';
import { PlainCodeRenderer } from './renderer';

export { CodeRenderPlugin } from '@fluxdown/react-base-presets/plugins/code';
export { CodeBlockSlotPlugin } from '../../slot/code-block';
export { CodeHeaderSlotPlugin } from '../../slot/code-header';

export class CodeHighlighterSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';
  readonly type = 'CodeHighlighter';
  readonly Component = PlainCodeRenderer;
}

export const CodePlugin: IPluginItem = {
  renders: [CodeRenderPlugin],
  slots: [CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin],
};
