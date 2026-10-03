import type { Element, Root, Text } from 'hast';

import { createHastProjection, sizeOfHast, sliceHast } from '../index';

const text = (value: string): Text => ({ type: 'text', value });

const root = (...children: Root['children']): Root => ({ type: 'root', children });

const element = (tagName: string, ...children: Element['children']): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

describe('HAST revision projections', () => {
  test('shares grapheme boundaries across length, full views and nested copied slices', () => {
    const source = root(element('p', text('A👨‍👩‍👧‍👦🇨🇳👍🏽e\u0301Z')));
    const segment = jest.spyOn(Intl.Segmenter.prototype, 'segment');

    try {
      const projection = createHastProjection(source);
      const full = projection.full;

      expect(segment).not.toHaveBeenCalled();
      expect(full?.root).toEqual(source);
      expect(full?.root).not.toBe(source);
      expect(projection.full).toBe(full);
      expect(full?.full).toBe(full);
      expect(projection.length).toBe(6);
      expect(full?.length).toBe(6);

      const middle = projection.slice(1, 5);
      const nested = middle?.slice(1, 3);

      expect(middle?.root).toEqual(root(element('p', text('👨‍👩‍👧‍👦🇨🇳👍🏽e\u0301'))));
      expect(nested?.root).toEqual(root(element('p', text('🇨🇳👍🏽'))));
      expect(nested?.length).toBe(2);

      for (let end = 1; end <= 6; end += 1) {
        expect(projection.slice(0, end)?.length).toBe(end);
      }

      expect(segment).toHaveBeenCalledTimes(1);
    } finally {
      segment.mockRestore();
    }
  });

  test('matches uncached visibility rules for every range through tables and hidden nodes', () => {
    const source = root(
      element('p', text('A👨‍👩‍👧‍👦'), element('img'), text('e\u0301')),
      text('\n'),
      element(
        'table',
        text('\n'),
        element('colgroup', element('col')),
        element('tbody', text('\n'), element('tr', element('td', text('甲乙')), element('td'))),
      ),
      text('\n'),
      element('script', text('hidden')),
      element('p', text(' Z')),
    );
    const projection = createHastProjection(source);
    const length = sizeOfHast(source);
    const bounds = [-Infinity, -1, 0, 0.9, 1, 2, 3, 5, 8, length + 1, Infinity, Number.NaN];

    expect(projection.length).toBe(length);
    expect(projection.full?.root).toEqual(sliceHast(source, 0, Infinity));

    for (const start of bounds) {
      for (const end of bounds) {
        const expected = sliceHast(source, start, end);
        const actual = projection.slice(start, end);

        expect(actual?.root ?? null).toEqual(expected);

        if (expected) {
          expect(actual?.length).toBe(sizeOfHast(expected));
        }
      }
    }
  });

  test('keeps copying public slices and reads subsequent mutable input changes', () => {
    const value = text('before');
    const source = root(value);
    const first = sliceHast(source, 0, Infinity);
    const second = sliceHast(source, 0, Infinity);

    expect(first).not.toBe(second);
    expect(first?.children[0]).not.toBe(second?.children[0]);

    value.value = 'after 👨‍👩‍👧‍👦';

    expect(sliceHast(source, 0, Infinity)).toEqual(root(text('after 👨‍👩‍👧‍👦')));
    expect(sizeOfHast(source)).toBe(7);
  });

  test('indexes each revision independently when appended characters change the last grapheme', () => {
    const before = createHastProjection(root(text('Ae')));
    const after = createHastProjection(root(text('Ae\u0301')));
    const replaced = createHastProjection(root(text('A👍🏽')));

    expect(before.length).toBe(2);
    expect(after.length).toBe(2);
    expect(replaced.length).toBe(2);
    expect(before.slice(1, 2)?.root).toEqual(root(text('e')));
    expect(after.slice(1, 2)?.root).toEqual(root(text('e\u0301')));
    expect(replaced.slice(1, 2)?.root).toEqual(root(text('👍🏽')));
  });

  test('uses iterative traversal for deeply nested input', () => {
    let child: Element | Text = text('👨‍👩‍👧‍👦e\u0301');

    for (let depth = 0; depth < 8_000; depth += 1) {
      child = element('span', child);
    }

    const projection = createHastProjection(root(child));

    expect(projection.length).toBe(2);
    expect(projection.full?.length).toBe(2);
    expect(projection.slice(1, 2)?.length).toBe(1);
  });
});
