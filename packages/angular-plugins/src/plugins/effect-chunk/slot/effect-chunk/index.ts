import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ChunkRenderer } from './renderer';

export * from './renderer';

export class EffectChunkSlotPlugin extends BaseSlotPlugin<'Chunk'> {
  static readonly key = 'slot-chunk';

  readonly Component = ChunkRenderer;

  readonly type = 'Chunk';

  readonly tagName = 'span';
}
