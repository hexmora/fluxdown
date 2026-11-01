import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { CodeShikiRenderer } from './renderer';

export * from './renderer';

export class CodeShikiSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeShikiRenderer;

  readonly type = 'CodeHighlighter';

  readonly tagName = 'pre';
}
