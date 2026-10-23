import type { ScaleAnimationConfig } from '../type';

export interface ScaleCharacter {
  text: string;

  start: number;
}

export interface ScaleRootConfig extends Required<ScaleAnimationConfig> {
  initial: boolean;

  start: number;
}
