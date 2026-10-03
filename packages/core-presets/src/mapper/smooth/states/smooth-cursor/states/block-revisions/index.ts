import type { IBlockState } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import { shallowEqual } from 'shallow-equal';
import { once, useClearable, useSwitchMap } from 'stative';

import type { BlockRevision, BlockRevisionsInputs } from './type';

import { createBlockRevision } from './utils';

export * from './type';

export const BlockRevisions = /*#__PURE__*/ once(function BlockRevisions<T>({
  source,
}: BlockRevisionsInputs<T>) {
  let entries = new Map<IBlockState<T>, IReadableClosure<BlockRevision>>();

  useClearable(() => entries.clear());

  // The next descriptor owns retained revisions before the previous list releases them.
  return useSwitchMap(
    source,
    (blocks) => {
      const previous = entries;

      entries = new Map();

      return blocks.map((block) => {
        const revision = entries.get(block) ?? previous.get(block) ?? createBlockRevision(block);

        entries.set(block, revision);

        return revision;
      });
    },
    shallowEqual,
  );
});
