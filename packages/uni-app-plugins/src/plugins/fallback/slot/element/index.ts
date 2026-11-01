import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ElementRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-element': IPluggableConfig<void>;
  }
}

export class ElementSlotPlugin extends BaseSlotPlugin<'Element'> {
  static readonly key = 'slot-element';

  readonly Component = ElementRenderer;

  readonly type = 'Element';
}
