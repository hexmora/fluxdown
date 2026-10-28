import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { LinkRenderer } from './renderer';

declare global {
  interface SolidSlotConfigs {
    'slot-link': IPluggableConfig<void>;
  }
}

export class LinkSlotPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'slot-link';

  readonly Component = LinkRenderer;

  readonly type = 'Link';
}
