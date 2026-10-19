import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

export interface ScaleAnimationConfig {
  /**
   * Duration of each character's entrance in milliseconds.
   * @default 200
   */
  duration?: number;

  /**
   * Initial character scale, between 0 and 1.
   * @default 0
   */
  from?: number;

  /**
   * Initial blur radius in em, relative to the character's font size.
   * @default 0.08
   */
  blur?: number;
}

export interface ScaleConfig extends ScaleAnimationConfig {
  /**
   * Animate newly visible characters without replaying existing content.
   * React effects enable this by default.
   * @default false
   */
  enabled?: boolean;
}

export type BaseScaleConfig = Required<ScaleConfig>;

export type ScaleBaseInputs = MapperConfigInputs<ScaleConfig>;

export type ScaleInputs = MapperInputs<ScaleBaseInputs, IBlockState<HastRoot>[]>;

export type ScalePluginConfig = MapperPluginConfig<ScaleConfig>;
