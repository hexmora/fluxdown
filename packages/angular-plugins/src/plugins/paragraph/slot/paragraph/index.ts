import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ParagraphRenderer } from './renderer';

export class ParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'slot-paragraph';

  readonly Component = ParagraphRenderer;

  readonly type = 'Paragraph';

  readonly tagName = 'p';
}
