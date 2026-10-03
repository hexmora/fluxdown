import type { Text } from 'hast';

import { clamp } from 'lodash-es';

import { getTextUnits } from '../content';
import { cloneTextFragment } from './content';

export type TextSelection = {
  node: Text | null;
  length: number;
};

export type TextContent = {
  size(node: Text): number;
  copy(node: Text): Text;
  slice(node: Text, start: number, end: number): TextSelection;
};

export const textContent: TextContent = {
  size(node) {
    let length = 0;

    for (const unit of getTextUnits(node.value)) {
      if (unit.length > 0) {
        length += 1;
      }
    }

    return length;
  },
  copy(node) {
    return cloneTextFragment(node, node.value);
  },
  slice(node, start, end) {
    const selected: string[] = [];

    let length = 0;

    for (const unit of getTextUnits(node.value)) {
      if (length >= end) {
        break;
      }

      if (length >= start) {
        selected.push(unit);
      }

      length += 1;
    }

    return {
      node: selected.length > 0 ? cloneTextFragment(node, selected.join('')) : null,
      length,
    };
  },
};

type TextIndex = {
  boundaries: readonly number[];
  offset: number;
  length: number;
};

type TextEntry = {
  index?: TextIndex;
};

/** Text fragments retain views into their revision's original grapheme boundaries. */
export class IndexedTextContent implements TextContent {
  private readonly entries = new WeakMap<Text, TextEntry>();

  private entryOf(node: Text) {
    let entry = this.entries.get(node);

    if (!entry) {
      entry = {};

      this.entries.set(node, entry);
    }

    return entry;
  }

  private indexOf(node: Text) {
    const entry = this.entryOf(node);

    if (!entry.index) {
      const boundaries = [0];

      let offset = 0;

      for (const unit of getTextUnits(node.value)) {
        offset += unit.length;

        boundaries.push(offset);
      }

      entry.index = { boundaries, offset: 0, length: boundaries.length - 1 };
    }

    return entry.index;
  }

  size(node: Text) {
    return this.indexOf(node).length;
  }

  copy(node: Text) {
    const copy = cloneTextFragment(node, node.value);

    this.entries.set(copy, this.entryOf(node));

    return copy;
  }

  slice(node: Text, start: number, end: number): TextSelection {
    const { boundaries, offset, length } = this.indexOf(node);
    const from = clamp(start, 0, length);
    const to = clamp(end, from, length);

    if (from === to) {
      return { node: null, length };
    }

    const origin = boundaries[offset] ?? 0;
    const value = node.value.slice(
      (boundaries[offset + from] ?? origin) - origin,
      (boundaries[offset + to] ?? origin) - origin,
    );
    const copy = cloneTextFragment(node, value);

    this.entries.set(copy, {
      index: { boundaries, offset: offset + from, length: to - from },
    });

    return { node: copy, length };
  }
}
