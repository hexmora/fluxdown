import type {
  CompilerConfig,
  IBlockRawMeta,
  IBlockState,
  IRehypePlugin,
  IRemarkPlugin,
  RemarkCompilerConfig,
} from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import type { HastRoot } from '../../../typings';
import type { IBlockSection } from '../../base';

export interface IBlockCompiler extends IReadableClosure<IBlockState<HastRoot>[]> {}

export type IBlockCompilerConfig = CompilerConfig;

export type BlockCompilerConfig = CompilerConfig;

export type BlockRemarksConfig = RemarkCompilerConfig;

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

  isLast: boolean;
};
