import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ScaleRenderer } from './renderer';

export * from './renderer';

export class EffectScaleSlotPlugin extends BaseSlotPlugin<'Scale'> {
  static readonly key = 'slot-scale';

  readonly Component = ScaleRenderer;

  readonly type = 'Scale';

  readonly tagName = 'span';
}
