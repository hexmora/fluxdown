import type { EntranceCharacter } from '../../../../utils';
import type { ShadAnimationConfig } from '../type';

export type ShadCharacter = EntranceCharacter;

export interface ShadRootConfig extends Required<ShadAnimationConfig> {
  initial: boolean;

  start: number;
}
