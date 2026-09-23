import type { IBlockState } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

export interface BlockRevision {
  length: number;

  /** Unchanged output units after a destructive edit; Infinity for append-only updates. */
  prefixLength: number;
}

export interface BlockRevisionsInputs<T> {
  /**
   * Blocks whose base revisions determine available progress and preserved prefixes.
   */
  source: IReadableClosure<IBlockState<T>[]>;
}
