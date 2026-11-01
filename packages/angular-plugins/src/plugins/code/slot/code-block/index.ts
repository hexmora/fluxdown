import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { CodeBlockRenderer } from './renderer';

export class CodeBlockSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-block';

  readonly Component = CodeBlockRenderer;

  readonly type = 'CodeBlock';

  readonly tagName = 'div';
}
