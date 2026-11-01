import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { BreakLineRenderer } from './renderer';

export class BreakLineSlotPlugin extends BaseSlotPlugin<'BreakLine'> {
  static readonly key = 'slot-break-line';

  readonly Component = BreakLineRenderer;

  readonly type = 'BreakLine';

  readonly tagName = 'br';
}
