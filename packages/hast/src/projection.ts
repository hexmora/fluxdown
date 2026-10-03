import type { Root as HastRoot } from 'hast';

import { countHast } from './base/size';
import { copyHastRange } from './base/slice';
import { IndexedTextContent } from './base/text';

export type HastProjection = {
  readonly root: HastRoot;
  readonly length: number;
  readonly full: HastProjection | null;

  slice(start: number, end: number): HastProjection | null;
};

class IndexedHast implements HastProjection {
  private lengthValue: number | undefined;

  private fullValue: IndexedHast | null | undefined;

  constructor(
    readonly root: HastRoot,
    private readonly text: IndexedTextContent,
  ) {}

  get length() {
    return (this.lengthValue ??= countHast(this.root, this.text));
  }

  get full(): IndexedHast | null {
    if (this.fullValue === undefined) {
      this.fullValue = this.slice(0, Infinity);

      if (this.fullValue) {
        this.fullValue.fullValue = this.fullValue;
      }
    }

    return this.fullValue;
  }

  slice(start: number, end: number): IndexedHast | null {
    const root = copyHastRange(this.root, start, end, this.text);

    return root ? new IndexedHast(root, this.text) : null;
  }
}

/**
 * Owns lazy indexes for one immutable HAST revision and its copied slices.
 * The root, returned roots and their descendants must remain immutable.
 * `full` reuses a normalized view; `slice` always copies selected nodes.
 */
export const createHastProjection = (root: HastRoot): HastProjection => {
  return new IndexedHast(root, new IndexedTextContent());
};
