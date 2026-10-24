import type { MapperConfigInputs, MapperInputs } from '@fluxdown/types';

import type { ChunkAnimationConfig } from '../../type';

export type ChunkAnimationInputs = MapperConfigInputs<Required<ChunkAnimationConfig>>;

export type ChunkBlocksInputs = MapperInputs<ChunkAnimationInputs>;
