import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

export interface ShadAnimationConfig {
  /**
   * Number of characters that should be fading in at once. Each arriving batch gets a shorter
   * fade when more characters are already fading, so roughly this many stay in flight.
   * @default 10
   */
  length?: number;

  /**
   * Longest opacity fade for one character in milliseconds, used while few characters are
   * fading.
   * @default 400
   */
  duration?: number;
}

export interface ShadConfig extends ShadAnimationConfig {
  /**
   * Fade newly visible characters in. React effects enable this by default.
   * @default false
   */
  enabled?: boolean;
}

export type BaseShadConfig = Required<ShadConfig>;

export type ShadBaseInputs = MapperConfigInputs<ShadConfig>;

export type ShadInputs = MapperInputs<ShadBaseInputs, IBlockState<HastRoot>[]>;

export type ShadPluginConfig = MapperPluginConfig<ShadConfig>;
