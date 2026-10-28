import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import BreakLineRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-break-line': IPluggableConfig<void>;
  }
}

export class BreakLineSlotPlugin extends BaseSlotPlugin<'BreakLine'> {
  static readonly key = 'slot-break-line';

  readonly Component = BreakLineRenderer;

  readonly type = 'BreakLine';
}
