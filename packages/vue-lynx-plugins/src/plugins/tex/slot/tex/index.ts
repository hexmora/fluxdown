import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexRenderer } from './renderer';

export * from './renderer';

declare global {
  interface VueSlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexRenderer;

  readonly type = 'Tex';
}
