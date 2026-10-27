import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexSvgRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexSvgSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexSvgRenderer;

  readonly type = 'Tex';
}
