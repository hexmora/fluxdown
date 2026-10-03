import type { Element, ElementContent, Root, RootContent, Text } from 'hast';

import { sliceHast } from '@fluxdown/hast';
import { create } from 'lodash-es';

import { BlockItem } from '..';

const root = (children: RootContent[]): Root => ({
  type: 'root',
  children,
});

const text = (value: string): Text => ({
  type: 'text',
  value,
});

const element = (tagName: string, children: ElementContent[] = []): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

class BlockStateSliceHarness extends BlockItem {
  applySlice(value: Root, start: number, end: number) {
    return this.slice(value, start, end);
  }

  measure(value: Root) {
    return this.lengthOf(value);
  }
}

describe('BlockItem slicing', () => {
  const closure = create(BlockStateSliceHarness.prototype) as BlockStateSliceHarness;

  test('delegates visible ranges to sliceHast', () => {
    const source = root([element('p', [text('hello')])]);

    expect(closure.applySlice(source, 1, 4)).toEqual(sliceHast(source, 1, 4));
  });

  test('creates a fresh metadata-preserving empty root for an empty range', () => {
    const source: Root = {
      type: 'root',
      children: [text('hello')],
      data: { sentinel: 'source' },
    };
    const first = closure.applySlice(source, 2, 2);
    const second = closure.applySlice(source, 2, 2);

    expect(first).toEqual({
      type: 'root',
      children: [],
      data: { sentinel: 'source' },
    });
    expect(second).toEqual(first);
    expect(first).not.toBe(second);
    expect(first.children).not.toBe(second.children);
  });

  test('shares revision indexes across independent block views and their slices', () => {
    const source = root([element('p', [text('A👨‍👩‍👧‍👦🇨🇳👍🏽e\u0301Z')])]);
    const other = create(BlockStateSliceHarness.prototype) as BlockStateSliceHarness;
    const segment = jest.spyOn(Intl.Segmenter.prototype, 'segment');

    try {
      expect(closure.measure(source)).toBe(6);
      expect(other.measure(source)).toBe(6);

      const slice = closure.applySlice(source, 1, 5);
      const nested = other.applySlice(slice, 1, 3);

      expect(other.measure(slice)).toBe(4);
      expect(closure.measure(nested)).toBe(2);
      expect(segment).toHaveBeenCalledTimes(1);
    } finally {
      segment.mockRestore();
    }
  });

  test.each([
    { name: 'hidden-only', source: root([element('script', [text('hidden')])]) },
    { name: 'empty table', source: root([element('table')]) },
    { name: 'comment-only', source: root([{ type: 'comment', value: 'hidden' }]) },
  ])('filters $name content for an explicit complete range', ({ source }) => {
    expect(closure.applySlice(source, 0, Infinity)).toEqual({ ...source, children: [] });
    expect(closure.measure(source)).toBe(0);
  });

  test('reuses the normalized full view without segmenting its text', () => {
    const source = root([element('p', [text('visible')]), element('script', [text('hidden')])]);
    const segment = jest.spyOn(Intl.Segmenter.prototype, 'segment');

    try {
      const first = closure.applySlice(source, 0, Infinity);
      const second = closure.applySlice(source, 0, Infinity);

      expect(first).toEqual(root([element('p', [text('visible')])]));
      expect(second).toBe(first);
      expect(segment).not.toHaveBeenCalled();
    } finally {
      segment.mockRestore();
    }
  });
});
