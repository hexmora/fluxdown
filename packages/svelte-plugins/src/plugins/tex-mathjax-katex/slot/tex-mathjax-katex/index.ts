import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexMathjaxKatexRenderer } from './tex-mathjax-katex-renderer';

export * from './tex-mathjax-katex-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexMathjaxKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexMathjaxKatexRenderer;

  readonly type = 'Tex';
}
