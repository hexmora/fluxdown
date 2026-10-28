import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import ChunkRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkSlotPlugin extends BaseSlotPlugin<'Chunk'> {
  static readonly key = 'slot-chunk';

  readonly Component = ChunkRenderer;

  readonly type = 'Chunk';
}
