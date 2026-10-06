import { once, S, useMap, useMapEach, useSelect } from 'stative';

import type { BlockCompilerInputs, BlockCompilerItem, IBlockCompiler } from './type';

import { isSectionEqual } from '../../base/text-chunker/utils';
import { CompiledBlockContent } from './states/compiled-block/content';

export * from './states';
export * from './type';

export const BlockCompiler = /*#__PURE__*/ once(
  ({ sections, config, getRemarks, getRehypes }: BlockCompilerInputs): IBlockCompiler => {
    let nextKey = 0;

    const count = useSelect(sections, (current) => current.length);

    const idPrefix = useMap(config, (current) => current.idPrefix);

    const items = useMap(sections, (current, previous): BlockCompilerItem[] => {
      let charEnd = 0;

      return current.map((section, currentIndex) => {
        const charStart = charEnd;

        charEnd += section.text.length;

        const isLast = currentIndex === current.length - 1;

        const previousItem = previous?.[1][currentIndex];

        const sameSection = previousItem && isSectionEqual(previousItem.section, section);

        if (
          previousItem &&
          previousItem.isLast === isLast &&
          previousItem.meta.charStart === charStart &&
          previousItem.meta.charEnd === charEnd &&
          sameSection
        ) {
          return previousItem;
        }

        return {
          section: sameSection ? previousItem.section : section,
          meta: { charStart, charEnd, currentIndex },
          isLast,
        };
      });
    });

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
