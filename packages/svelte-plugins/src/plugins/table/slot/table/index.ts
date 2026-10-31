import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TableRenderer } from './table-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-table': IPluggableConfig<void>;
  }
}

export class TableSlotPlugin extends BaseSlotPlugin<'Table'> {
  static readonly key = 'slot-table';

  readonly Component = TableRenderer;

  readonly type = 'Table';
}
