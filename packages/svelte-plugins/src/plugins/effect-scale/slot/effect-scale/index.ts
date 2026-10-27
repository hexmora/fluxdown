import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ScaleRenderer } from './scale-renderer';

export * from './scale-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleSlotPlugin extends BaseSlotPlugin<'Scale'> {
  static readonly key = 'slot-scale';

  readonly Component = ScaleRenderer;

  readonly type = 'Scale';
}
