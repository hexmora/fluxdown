import { once, S, useMap, useMapEach, useSelect } from 'stative';

import type { BlockCompilerInputs, IBlockCompiler } from './type';

import { CompiledBlockContent } from './states';
import { getItems } from './utils';

export { CompiledBlock, type CompiledBlockInputs } from './states';
export * from './type';

export const BlockCompiler = /*#__PURE__*/ once(
  ({ sections, config, getRemarks, getRehypes }: BlockCompilerInputs): IBlockCompiler => {
    let nextKey = 0;

    const count = useSelect(sections, (current) => current.length);

    const idPrefix = useMap(config, (current) => current.idPrefix);

    const items = useMap(sections, getItems);

    return useMapEach(items, (item) =>
      S([
        CompiledBlockContent,
        {
          item,
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
