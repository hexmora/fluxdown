import type { IBlockState } from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';

import { Subscription } from 'rxjs';
import { D, type IReadableClosure, render, S } from 'stative';

import type { ShadPosition } from '../shad-progress';
import type { ShadBlockEntry } from './type';

import { ShadBlock } from './states';

export const clearShadBlocks = (entries: Map<IBlockState<HastRoot>, ShadBlockEntry>) => {
  const cleanup = new Subscription();

  entries.forEach(({ closure }) => cleanup.add(() => closure.destroy()));

  entries.clear();

  cleanup.unsubscribe();
};

export const toShadBlocks = (
  entries: Map<IBlockState<HastRoot>, ShadBlockEntry>,
  items: IBlockState<HastRoot>[],
  tail: IReadableClosure<IBlockState<HastRoot> | undefined>,
  progress: IReadableClosure<ShadPosition>,
): IBlockState<HastRoot>[] => {
  const retained = new Set(items);

  for (const [source, entry] of entries) {
    if (!retained.has(source)) {
      entries.delete(source);

      entry.closure.destroy();
    }
  }

  return items.map((source) => {
    const existing = entries.get(source);

    if (existing) {
      return existing.block;
    }

    const closure = render(S([ShadBlock, { source: D(source), tail, progress }]));

    try {
      const block = closure.value.value;

      entries.set(source, { closure, block });

      return block;
    } catch (error) {
      closure.destroy();

      throw error;
    }
  });
};
