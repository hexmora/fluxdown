import type { IBlockState } from '@fluxdown/types';

import { Subscription } from 'rxjs';
import { D, type IReadableClosure, MutableState, render, S } from 'stative';

import type { CutoffBlockEntry } from './type';

import { CutoffBlock } from './states';

const releaseCutoffBlock = <T>({ end, closure }: CutoffBlockEntry<T>) => {
  try {
    closure.destroy();
  } finally {
    end.destroy();
  }
};

export const clearCutoffBlocks = <T>(entries: Map<IBlockState<T>, CutoffBlockEntry<T>>) => {
  const cleanup = new Subscription();

  entries.forEach((entry) => cleanup.add(() => releaseCutoffBlock(entry)));

  entries.clear();

  cleanup.unsubscribe();
};

export const toCutoffBlocks = <T>(
  entries: Map<IBlockState<T>, CutoffBlockEntry<T>>,
  items: IBlockState<T>[],
  count: IReadableClosure<number>,
): IBlockState<T>[] => {
  const cleanup = new Subscription();

  const retained = new Set(items);

  for (const [source, entry] of entries) {
    if (!retained.has(source)) {
      entries.delete(source);

      cleanup.add(() => releaseCutoffBlock(entry));
    }
  }

  cleanup.unsubscribe();

  return items.map((source) => {
    let entry = entries.get(source);

    if (!entry) {
      const range = MutableState.of<number | null>(null);

      const closure = render(S([CutoffBlock<T>, { source: D(source), end: range, count }]));

      entry = { end: range, closure };

      entries.set(source, entry);
    }

    try {
      return entry.closure.value.value;
    } catch (error) {
      entries.delete(source);

      releaseCutoffBlock(entry);

      throw error;
    }
  });
};

export const updateCutoffBoundary = <T>(
  previous: CutoffBlockEntry<T> | undefined,
  current: CutoffBlockEntry<T> | undefined,
  end: number,
): CutoffBlockEntry<T> | undefined => {
  if (previous && previous !== current && !previous.end.closed) {
    previous.end.next(null);
  }

  current?.end.next(end);

  return current;
};
