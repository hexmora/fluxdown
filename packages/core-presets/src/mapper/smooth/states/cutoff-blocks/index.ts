import type { IBlockState } from '@fluxdown/types';

import { shallowEqual } from 'shallow-equal';
import { once, useClearable, useCombineMap, useMap } from 'stative';

import type { CutoffBlockEntry, CutoffBlocksInputs } from './type';

import { clearCutoffBlocks, toCutoffBlocks, updateCutoffBoundary } from './utils';

export * from './type';

export const CutoffBlocks = /*#__PURE__*/ once(function CutoffBlocks<T>({
  items,
  end,
}: CutoffBlocksInputs<T>) {
  const entries = new Map<IBlockState<T>, CutoffBlockEntry<T>>();

  let previous: IBlockState<T>[] | undefined;

  let blocks: IBlockState<T>[] = [];

  let boundary: CutoffBlockEntry<T> | undefined;

  useClearable(() => clearCutoffBlocks(entries));

  const blockIndex = useMap(end, (position) => position.blockIndex);

  const visible = useCombineMap(
    [items, blockIndex],
    ([current, index]) => current.slice(0, Math.max(0, index + 1)),
    shallowEqual,
  );

  const count = useMap(visible, (current) => current.length);

  return useCombineMap(
    [visible, end, count],
    ([current, position]) => {
      if (current !== previous) {
        blocks = toCutoffBlocks(entries, current, count);

        previous = current;
      }

      boundary = updateCutoffBoundary(
        boundary,
        entries.get(current[position.blockIndex]),
        position.charIndex,
      );

      return blocks;
    },
    shallowEqual,
  );
});
