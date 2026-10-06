import { once, S } from 'stative';

import type { DocumentCompilerInputs } from './type';

import { useBlockCompiler } from '../../../hast/block-compiler/blocks';
import { DocumentBlockContent } from './block';

export const DocumentCompiler = /*#__PURE__*/ once(function DocumentCompiler({
  plugins,
  ...inputs
}: DocumentCompilerInputs) {
  return useBlockCompiler(inputs, (block) => S([DocumentBlockContent, { ...block, plugins }]));
});
