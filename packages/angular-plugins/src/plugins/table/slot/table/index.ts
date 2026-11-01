import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { TableRenderer } from './renderer';

export class TableSlotPlugin extends BaseSlotPlugin<'Table'> {
  static readonly key = 'slot-table';

  readonly Component = TableRenderer;

  readonly type = 'Table';

  readonly tagName = 'div';
}
