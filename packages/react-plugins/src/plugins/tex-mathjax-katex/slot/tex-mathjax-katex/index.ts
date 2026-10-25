import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexMathjaxKatexRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexMathjaxKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexMathjaxKatexRenderer;

  readonly type = 'Tex';
}
