import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { SuffixRenderer } from './renderer';

export * from './renderer';

export class EffectSuffixSlotPlugin extends BaseSlotPlugin<'Suffix'> {
  static readonly key = 'slot-suffix';

  readonly Component = SuffixRenderer;

  readonly type = 'Suffix';
}
