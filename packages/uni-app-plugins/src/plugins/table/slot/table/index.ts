import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import TableRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-table': IPluggableConfig<void>;
  }
}

export class TableSlotPlugin extends BaseSlotPlugin<'Table'> {
  static readonly key = 'slot-table';

  readonly Component = TableRenderer;

  readonly type = 'Table';
}
