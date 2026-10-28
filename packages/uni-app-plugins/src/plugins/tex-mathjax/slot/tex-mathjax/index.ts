import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base/slot/base';
import TexMathjaxRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-tex-mathjax': IPluggableConfig<void>;
  }
}

export class TexMathjaxSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex-mathjax';

  readonly Component = TexMathjaxRenderer;

  readonly type = 'Tex';
}
