import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { EmphasisRenderer } from './emphasis-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-emphasis': IPluggableConfig<void>;
  }
}

export class EmphasisSlotPlugin extends BaseSlotPlugin<'Emphasis'> {
  static readonly key = 'slot-emphasis';

  readonly Component = EmphasisRenderer;

  readonly type = 'Emphasis';
}
