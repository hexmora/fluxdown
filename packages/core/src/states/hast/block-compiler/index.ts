import { isEqual } from 'lodash-es';
import { mapClosure, once, S, useMap, useMapEach } from 'stative';

import type { BlockCompilerInputs, BlockCompilerItem, IBlockCompiler } from './type';

import { isSectionEqual } from '../../base/text-chunker/utils';
import { CompiledBlock } from './states';
import { isItemEqual } from './utils';

export * from './states';
export * from './type';

export const BlockCompiler = /*#__PURE__*/ once(
  ({ sections, config, getRemarks, getRehypes }: BlockCompilerInputs): IBlockCompiler => {
    let nextKey = 0;

    const count = useMap(sections, (current) => current.length);

    const items = useMap(sections, (current, previous): BlockCompilerItem[] => {
      let charEnd = 0;

      return current.map((section, currentIndex) => {
        const charStart = charEnd;

        charEnd += section.text.length;

        const item: BlockCompilerItem = {
          section,
          meta: { charStart, charEnd, currentIndex },
          isLast: currentIndex === current.length - 1,
        };

        const previousItem = previous?.[1][currentIndex];

        if (previousItem && isItemEqual(previousItem, item)) {
          return previousItem;
        }

        return item;
      });
    });

    return useMapEach(
      items,
      (item) =>
        S([
          CompiledBlock,
          {
            section: mapClosure(item, (current) => current.section, isSectionEqual),
            meta: mapClosure(item, (current) => current.meta, isEqual),
            isLast: mapClosure(item, (current) => current.isLast),
            count,
            key: String(++nextKey),
            config,
            getRemarks,
            getRehypes,
          },
        ]),
      isItemEqual,
    );
  },
);
