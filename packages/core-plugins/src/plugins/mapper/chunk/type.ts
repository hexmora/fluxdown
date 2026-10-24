import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

export interface ChunkAnimationConfig {
  /**
   * Duration of each incoming chunk's opacity entrance in milliseconds.
   * @default 400
   */
  duration?: number;
}

export interface ChunkConfig extends ChunkAnimationConfig {
  /**
   * Fade newly visible chunks without replaying existing content.
   * React effects enable this by default.
   * @default false
   */
  enabled?: boolean;
}

export type BaseChunkConfig = Required<ChunkConfig>;

export type ChunkBaseInputs = MapperConfigInputs<ChunkConfig>;

export type ChunkInputs = MapperInputs<ChunkBaseInputs, IBlockState<HastRoot>[]>;

export type ChunkPluginConfig = MapperPluginConfig<ChunkConfig>;
