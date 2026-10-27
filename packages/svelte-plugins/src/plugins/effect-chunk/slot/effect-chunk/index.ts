import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { ChunkRenderer } from './chunk-renderer';

export * from './chunk-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkSlotPlugin extends BaseSlotPlugin<'Chunk'> {
  static readonly key = 'slot-chunk';

  readonly Component = ChunkRenderer;

  readonly type = 'Chunk';
}
