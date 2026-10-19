import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';
import type { IReadableClosure } from 'stative';

import { shallowEqual } from 'shallow-equal';
import { D, once, render, S, useClearable, useMap } from 'stative';

import type { SuffixType } from './type';

import { createSuffixRoot } from './utils';

type Block = IBlockState<HastRoot>;

type SuffixBlockInputs = {
  source: Block;
  type: IReadableClosure<SuffixType>;
};

const SuffixValue = /*#__PURE__*/ once(function SuffixValue({
  source,
  current,
  type,
}: SuffixBlockInputs & { current: Block }) {
  // Reapply preceding mappers to this fork's range, so either ordering with
  // Smooth follows the visible endpoint instead of the unrevealed source tail.
  const previous = useClearable(source.fork({ range: current.range, meta: current.meta }));

  return useMap([previous.value, current.meta, type], ([root, meta, markerType]) =>
    meta.currentIndex === meta.blockCount - 1 ? createSuffixRoot(root, markerType) : root,
  );
});

const SuffixBlock = /*#__PURE__*/ once(function SuffixBlock({ source, type }: SuffixBlockInputs) {
  const fork = useClearable(
    source.fork({
      mapper: (_value, current) =>
        render(
          S([
            SuffixValue,
            {
              source: D(source),
              current: D(current),
              type,
            },
          ]),
        ),
    }),
  );

  return D(fork);
});

export const SuffixBlocks = /*#__PURE__*/ once(function SuffixBlocks({
  source,
  type,
}: {
  source: IReadableClosure<Block[]>;
  type: IReadableClosure<SuffixType>;
}) {
  const entries = new Map<Block, { closure: IReadableClosure<Block>; block: Block }>();

  useClearable(() => {
    entries.forEach(({ closure }) => closure.destroy());
    entries.clear();
  });

  return useMap(
    source,
    (items) => {
      for (const [block, entry] of entries) {
        if (!items.includes(block)) {
          entries.delete(block);
          entry.closure.destroy();
        }
      }

      return items.map((blockSource) => {
        const existing = entries.get(blockSource);

        if (existing) {
          return existing.block;
        }

        const closure = render(S([SuffixBlock, { source: D(blockSource), type }]));

        try {
          const block = closure.value.value;
          entries.set(blockSource, { closure, block });
          return block;
        } catch (error) {
          closure.destroy();
          throw error;
        }
      });
    },
    shallowEqual,
  );
});
