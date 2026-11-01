import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ShadRenderer } from './renderer';

export * from './renderer';

export class EffectShadSlotPlugin extends BaseSlotPlugin<'Shad'> {
  static readonly key = 'slot-shad';

  readonly Component = ShadRenderer;

  readonly type = 'Shad';

  readonly tagName = 'span';
}
