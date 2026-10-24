import type {
  IBlockState,
  MapperConfigInputs,
  MapperInputs,
  MapperPluginConfig,
} from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

export type SuffixType = 'cursor' | 'dot' | (string & {});

export interface SuffixConfig {
  /**
   * Append a marker to the last visible block. React effects enable this by default.
   * @default false
   */
  enabled?: boolean;

  /**
   * Marker type. The default React renderer supports cursor and dot; other strings
   * remain in HAST for custom render plugins and render nothing by default.
   * @default 'cursor'
   */
  type?: SuffixType;
}

export type BaseSuffixConfig = Required<SuffixConfig>;

export type SuffixInputs = MapperInputs<MapperConfigInputs<SuffixConfig>, IBlockState<HastRoot>[]>;

export type SuffixPluginConfig = MapperPluginConfig<SuffixConfig>;
