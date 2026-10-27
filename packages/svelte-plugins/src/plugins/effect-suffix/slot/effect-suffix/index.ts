import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { SuffixRenderer } from './suffix-renderer';

export * from './suffix-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-suffix': IPluggableConfig<void>;
  }
}

export class EffectSuffixSlotPlugin extends BaseSlotPlugin<'Suffix'> {
  static readonly key = 'slot-suffix';

  readonly Component = SuffixRenderer;

  readonly type = 'Suffix';
}
