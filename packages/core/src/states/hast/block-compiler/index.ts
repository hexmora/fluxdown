import { once, S } from 'stative';

import type { BlockCompilerInputs, IBlockCompiler } from './type';

import { useBlockCompiler } from './blocks';
import { CompiledBlockContent } from './states/compiled-block/content';

export * from './states';
export * from './type';

export const BlockCompiler = /*#__PURE__*/ once(
  ({ getRemarks, getRehypes, ...inputs }: BlockCompilerInputs): IBlockCompiler =>
    useBlockCompiler(inputs, (block) =>
      S([CompiledBlockContent, { ...block, getRemarks, getRehypes }]),
    ),
);
