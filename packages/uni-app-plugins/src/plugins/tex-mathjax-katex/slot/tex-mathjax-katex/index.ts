import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base/slot/base';
import { TexMathjaxKatexRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-tex-mathjax-katex': IPluggableConfig<void>;
  }
}

export class TexMathjaxKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex-mathjax-katex';

  readonly Component = TexMathjaxKatexRenderer;

  readonly type = 'Tex';
}
