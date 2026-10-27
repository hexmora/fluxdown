import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { LinkRenderer } from './link-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-link': IPluggableConfig<void>;
  }
}

export class LinkSlotPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'slot-link';

  readonly Component = LinkRenderer;

  readonly type = 'Link';
}
