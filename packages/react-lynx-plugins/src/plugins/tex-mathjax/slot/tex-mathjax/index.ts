import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexMathJaxRenderer } from './renderer';

export * from './renderer';

declare global {
  interface ReactLynxSlotConfigs {
    'slot-tex-mathjax': IPluggableConfig<void>;
  }
}

export class TexMathJaxSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex-mathjax';

  readonly Component = TexMathJaxRenderer;

  readonly type = 'Tex';
}
