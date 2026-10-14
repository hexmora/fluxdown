import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';

import { ShadRenderer } from './renderer';

declare global {
  interface SlotConfigs {
    'slot-shad'?: IPluggableConfig<void>;
  }
}

export class ShadSlotPlugin extends BaseSlotPlugin<'Shad'> {
  static readonly key = 'slot-shad';

  readonly Component = ShadRenderer;

  readonly type = 'Shad';
}
