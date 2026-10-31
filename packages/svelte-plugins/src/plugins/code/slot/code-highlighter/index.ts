import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeHighlighterRenderer } from './code-highlighter-renderer';

export * from './code-highlighter-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodeHighlighterSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeHighlighterRenderer;

  readonly type = 'CodeHighlighter';
}
