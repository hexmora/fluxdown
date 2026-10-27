import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { HeadingRenderer } from './heading-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-heading': IPluggableConfig<void>;
  }
}

export class HeadingSlotPlugin extends BaseSlotPlugin<'Heading'> {
  static readonly key = 'slot-heading';

  readonly Component = HeadingRenderer;

  readonly type = 'Heading';
}
