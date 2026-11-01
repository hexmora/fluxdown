import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { CodeHeaderRenderer } from './renderer';

export class CodeHeaderSlotPlugin extends BaseSlotPlugin<'CodeHeader'> {
  static readonly key = 'slot-code-header';

  readonly Component = CodeHeaderRenderer;

  readonly type = 'CodeHeader';

  readonly tagName = 'div';
}
