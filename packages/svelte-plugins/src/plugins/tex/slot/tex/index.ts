import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { TexRenderer } from './tex-renderer';

export * from './tex-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-tex': IPluggableConfig<void>;
  }
}

export class TexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexRenderer;

  readonly type = 'Tex';
}
