import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ScaleWordRenderer } from './renderer';

export * from './renderer';

export class EffectScaleWordSlotPlugin extends BaseSlotPlugin<'ScaleWord'> {
  static readonly key = 'slot-scale-word';

  readonly Component = ScaleWordRenderer;

  readonly type = 'ScaleWord';
}
