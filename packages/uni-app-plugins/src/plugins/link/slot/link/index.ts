import type { IPluggableConfig } from '@fluxdown/types';

import type { LinkSlotConfig } from './type';

import { BaseSlotPlugin } from '../../../../base';
import { LinkRenderer } from './renderer';

export * from './type';

declare global {
  interface UniSlotConfigs {
    'slot-link': IPluggableConfig<LinkSlotConfig>;
  }
}

export class LinkSlotPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'slot-link';

  readonly Component = LinkRenderer;

  readonly type = 'Link';

  readonly props: Record<string, unknown>;

  constructor(config: LinkSlotConfig = {}) {
    super();

    this.props = { onPress: config.onPress };
  }
}
