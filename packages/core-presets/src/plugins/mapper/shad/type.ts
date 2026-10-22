import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

export interface ShadConfig {
  /**
   * Shade the tail of newly visible content. React effects enable this by default.
   * @default false
   */
  enabled?: boolean;

  /**
   * Maximum number of visible characters in the shaded tail.
   * @default 10
   */
  length?: number;

  /**
   * Width of the trailing gradient in pixels.
   * @default 15
   */
  maskWidth?: number;
}

export type BaseShadConfig = Required<ShadConfig>;

export type ShadBaseInputs = MapperConfigInputs<ShadConfig>;

export type ShadInputs = MapperInputs<ShadBaseInputs, IBlockState<HastRoot>[]>;

export type ShadPluginConfig = MapperPluginConfig<ShadConfig>;
