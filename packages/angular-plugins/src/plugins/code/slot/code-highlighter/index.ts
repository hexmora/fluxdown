import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { CodeHighlighterRenderer } from './renderer';

export * from './renderer';

export class CodeHighlighterSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeHighlighterRenderer;

  readonly type = 'CodeHighlighter';

  readonly tagName = 'pre';
}
