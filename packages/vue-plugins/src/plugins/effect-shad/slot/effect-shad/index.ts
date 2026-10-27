import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ShadRenderer } from './renderer';

export * from './renderer';

declare global {
  interface VueSlotConfigs {
    'slot-shad': IPluggableConfig<void>;
  }
}

export class EffectShadSlotPlugin extends BaseSlotPlugin<'Shad'> {
  static readonly key = 'slot-shad';

  readonly Component = ShadRenderer;

  readonly type = 'Shad';
}
