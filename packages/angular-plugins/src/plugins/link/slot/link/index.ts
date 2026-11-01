import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { LinkRenderer } from './renderer';

export class LinkSlotPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'slot-link';

  readonly Component = LinkRenderer;

  readonly type = 'Link';

  readonly tagName = 'a';
}
