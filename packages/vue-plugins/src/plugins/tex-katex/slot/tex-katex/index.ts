import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexKatexRenderer } from './renderer';

export * from './renderer';

declare global {
  interface VueSlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexKatexRenderer;

  readonly type = 'Tex';
}
