import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { HeadingRenderer } from './renderer';

declare global {
  interface ReactLynxSlotConfigs {
    'slot-heading': IPluggableConfig<void>;
  }
}

export class HeadingSlotPlugin extends BaseSlotPlugin<'Heading'> {
  static readonly key = 'slot-heading';

  readonly Component = HeadingRenderer;

  readonly type = 'Heading';
}
