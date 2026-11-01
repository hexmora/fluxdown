import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { CodePeleRenderer } from './renderer';

export * from './renderer';

export class CodePeleSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-pele';

  readonly Component = CodePeleRenderer;

  readonly type = 'CodeBlock';

  readonly tagName = 'div';
}
