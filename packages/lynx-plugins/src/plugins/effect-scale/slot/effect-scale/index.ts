import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ScaleRenderer } from './renderer';

export * from './renderer';

declare global {
  interface LynxSlotConfigs {
    'slot-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleSlotPlugin extends BaseSlotPlugin<'Scale'> {
  static readonly key = 'slot-scale';

  readonly Component = ScaleRenderer;

  readonly type = 'Scale';
}
