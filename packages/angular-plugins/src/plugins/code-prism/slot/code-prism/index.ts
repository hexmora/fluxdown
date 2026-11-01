import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { CodePrismRenderer } from './renderer';

export * from './renderer';

export class CodePrismSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodePrismRenderer;

  readonly type = 'CodeHighlighter';

  readonly tagName = 'pre';
}
