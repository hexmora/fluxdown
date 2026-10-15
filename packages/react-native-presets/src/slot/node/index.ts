import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';

import { NodeRenderer } from './renderer';

declare global {
  interface SlotConfigs {
    'slot-node'?: IPluggableConfig<void>;
  }
}

export class NodeSlotPlugin extends BaseSlotPlugin<'Node'> {
  static readonly key = 'slot-node';

  readonly Component = NodeRenderer;

  readonly type = 'Node';
}
