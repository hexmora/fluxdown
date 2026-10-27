import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ShadRenderer } from './shad-renderer';

export * from './shad-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-shad': IPluggableConfig<void>;
  }
}

export class EffectShadSlotPlugin extends BaseSlotPlugin<'Shad'> {
  static readonly key = 'slot-shad';

  readonly Component = ShadRenderer;

  readonly type = 'Shad';
}
