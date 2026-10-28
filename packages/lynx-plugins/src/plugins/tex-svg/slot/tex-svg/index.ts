import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexSvgRenderer } from './renderer';

export * from './renderer';

declare global {
  interface LynxSlotConfigs {
    'slot-tex-svg': IPluggableConfig<void>;
  }
}

export class TexSvgSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex-svg';

  readonly Component = TexSvgRenderer;

  readonly type = 'Tex';
}
