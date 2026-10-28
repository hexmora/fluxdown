import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ScaleWordRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SolidSlotConfigs {
    'slot-scale-word': IPluggableConfig<void>;
  }
}

export class EffectScaleWordSlotPlugin extends BaseSlotPlugin<'ScaleWord'> {
  static readonly key = 'slot-scale-word';

  readonly Component = ScaleWordRenderer;

  readonly type = 'ScaleWord';
}
