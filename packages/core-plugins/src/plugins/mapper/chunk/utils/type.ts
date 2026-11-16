import type { EntranceCharacter } from '../../../../utils';
import type { ChunkAnimationConfig } from '../type';

export type ChunkCharacter = EntranceCharacter;

export interface ChunkRootConfig extends Required<ChunkAnimationConfig> {
  initial: boolean;

  start: number;
}
