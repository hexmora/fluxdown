import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import HeadingRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-heading': IPluggableConfig<void>;
  }
}

export class HeadingSlotPlugin extends BaseSlotPlugin<'Heading'> {
  static readonly key = 'slot-heading';

  readonly Component = HeadingRenderer;

  readonly type = 'Heading';
}
