import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexKatexRenderer } from './tex-katex-renderer';

export * from './tex-katex-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexKatexRenderer;

  readonly type = 'Tex';
}
