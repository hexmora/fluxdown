import { D, once, S, useMap, useMapEach } from 'stative';

import type { BlockCompilerInputs, IBlockCompiler } from './type';

import { MarkdownCompiler } from './exports';
import { CompiledBlockContent } from './states';
import { getItems } from './utils';

export { CompiledBlock, type CompiledBlockInputs } from './states';
export * from './type';

export const BlockCompiler = /*#__PURE__*/ once(
  ({ sections, config, getRemarks, getRehypes }: BlockCompilerInputs): IBlockCompiler => {
    const compiler = new MarkdownCompiler();

    let nextKey = 0;

    const count = useMap(sections, (current) => current.length);

    const idPrefix = useMap(config, (current) => current.idPrefix);

    const items = useMap(sections, getItems);

    return useMapEach(items, (item) =>
      S([
        CompiledBlockContent,
        {
          item,
          compiler: D(compiler),
          idPrefix,
          count,
          key: String(++nextKey),
          config,
          getRemarks,
          getRehypes,
        },
      ]),
    );
  },
);
