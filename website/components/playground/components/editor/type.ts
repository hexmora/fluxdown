import type { Locale } from '../../../type';
import type { ANIMATION_SPEEDS, CHUNK_PACES } from './consts';

export type EditorEffect = 'none' | 'shad' | 'scale';

export type AnimationSpeed = (typeof ANIMATION_SPEEDS)[number];

export type ChunkPace = keyof typeof CHUNK_PACES;

export interface EditorTuning {
  /**
   * Spring angular frequency ω in rad/s.
   */
  frequency: number;

  /**
   * Spring damping ratio ζ.
   */
  dampingRatio: number;

  pace: ChunkPace;

  /**
   * Trailing-fade length in characters.
   */
  fadeLength: number;

  /**
   * Scale entrance duration in milliseconds at 1×.
   */
  entranceDuration: number;
}

export type EditorProps = {
  lang: Locale;
};
