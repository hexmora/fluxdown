import type {
  IBlockRawMeta,
  IBlockState,
  IRawPatchItem,
  IRehypePlugin,
  IRemarkPlugin,
} from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { HastRoot } from '../../../typings';
import type { IBlockSection } from '../../base';

export interface IBlockCompiler extends IReadableClosure<IBlockState<HastRoot>[]> {}

export type IBlockCompilerConfig = {
  repair: boolean;

  repairEnding: boolean;

  footnote: boolean;

  /** Stable namespace for generated footnote IDs. React supplies a hydration-safe instance ID. */
  idPrefix?: string;

  tex: boolean;

  /** Recognize indented code blocks. */
  indentedCode: boolean;

  /** Recognize headings underlined with equals signs or dashes. */
  setextHeading: boolean;
};

export type BlockCompilerConfig = IBlockCompilerConfig;

export type BlockRemarksConfig = BlockCompilerConfig & {
  patches: IRawPatchItem[];
};

export type BlockCompilerInputs = {
  sections: IReadableClosure<IBlockSection[]>;

  config: IReadableClosure<BlockCompilerConfig>;

  getRemarks: (params: {
    config: IReadableClosure<BlockRemarksConfig>;
  }) => IReadableClosure<IRemarkPlugin[]>;

  getRehypes: () => IReadableClosure<IRehypePlugin[]>;
};

export type BlockCompilerItem = {
  meta: IBlockRawMeta;

  section: IBlockSection;
};
