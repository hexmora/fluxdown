import type { ChunkAnimationConfig } from '../type';

export interface ChunkCharacter {
  text: string;

  start: number;

  /** Duration captured when this batch first became visible. */
  duration: number;
}

export interface ChunkRootConfig extends Required<ChunkAnimationConfig> {
  initial: boolean;

  start: number;
}
