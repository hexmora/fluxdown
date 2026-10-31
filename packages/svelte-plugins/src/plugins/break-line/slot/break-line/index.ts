import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { BreakLineRenderer } from './break-line-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-break-line': IPluggableConfig<void>;
  }
}

export class BreakLineSlotPlugin extends BaseSlotPlugin<'BreakLine'> {
  static readonly key = 'slot-break-line';

  readonly Component = BreakLineRenderer;

  readonly type = 'BreakLine';
}
