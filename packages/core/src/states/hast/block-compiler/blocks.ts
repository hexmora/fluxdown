import type { IBlockState } from '@fluxdown/types';
import type { MarkedStateClosureDescriptor } from 'stative';

import { useMap, useMapEach, useSelect } from 'stative';

import type { HastRoot } from '../../../typings';
import type { BlockContentInputs } from './states/compiled-block/type';
import type { BlockCompilerInputs, BlockCompilerItem } from './type';

import { isSectionEqual } from '../../base/text-chunker/utils';

export const useBlockCompiler = (
  { sections, config }: Pick<BlockCompilerInputs, 'sections' | 'config'>,
  renderBlock: (inputs: BlockContentInputs) => MarkedStateClosureDescriptor<IBlockState<HastRoot>>,
) => {
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
    renderBlock({
      item,
      idPrefix,
      count,
      key: String(++nextKey),
      config,
    }),
  );
};
