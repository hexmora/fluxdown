import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base/slot/base';
import { TexKatexRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-tex-katex': IPluggableConfig<void>;
  }
}

export class TexKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex-katex';

  readonly Component = TexKatexRenderer;

  readonly type = 'Tex';
}
