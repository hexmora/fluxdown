import type { Element, Root as HastRoot, RootContent } from 'hast';

import { createShadRoot, FadeConcurrency, SHAD_DATA_ATTR, SHAD_FADE_VALUE } from '..';

const paragraph = (value: string): HastRoot => ({
  type: 'root',
  children: [
    { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value }] },
  ],
});

const readFades = (node: HastRoot | RootContent): Element[] => {
  if (node.type === 'element' && node.properties[SHAD_DATA_ATTR] === SHAD_FADE_VALUE) {
    return [node];
  }

  return 'children' in node ? node.children.flatMap(readFades) : [];
};

const describeFades = (root: HastRoot) =>
  readFades(root).map((node) => ({
    text: (node.children[0] as { value: string }).value,
    start: node.properties.dataShadStart,
    duration: node.properties.dataShadDuration,
  }));

const config = { initial: false, length: 10, duration: 400 };

describe('FadeConcurrency', () => {
  test('gives the longest fade while at most `length` characters are in flight', () => {
    const concurrency = new FadeConcurrency();

    expect(concurrency.allocate(0, 4, 10, 400)).toBe(400);

    expect(concurrency.allocate(10, 6, 10, 400)).toBe(400);

    expect(concurrency.count(10)).toBe(10);
  });

  test('shortens fades in proportion to how many characters are in flight', () => {
    const concurrency = new FadeConcurrency();

    concurrency.allocate(0, 10, 10, 400);

    // 10 still fading plus 10 arriving: twice the target, so half the duration.
    expect(concurrency.allocate(100, 10, 10, 400)).toBe(200);

    // A single burst larger than the target is shortened on its own.
    expect(new FadeConcurrency().allocate(0, 40, 10, 400)).toBe(100);
  });

  test('stops counting fades once they finish', () => {
    const concurrency = new FadeConcurrency();

    concurrency.allocate(0, 10, 10, 400);

    concurrency.allocate(100, 10, 10, 400);

    expect(concurrency.count(299)).toBe(20);

    expect(concurrency.count(300)).toBe(10);

    expect(concurrency.count(400)).toBe(0);

    expect(concurrency.allocate(400, 3, 10, 400)).toBe(400);
  });

  test('records nothing for an empty batch', () => {
    const concurrency = new FadeConcurrency();

    expect(concurrency.allocate(0, 0, 10, 400)).toBe(400);

    expect(concurrency.count(0)).toBe(0);
  });
});

describe('createShadRoot', () => {
  test('leaves initial content settled and fades only appended characters', () => {
    const concurrency = new FadeConcurrency();

    const root = paragraph('Hello');

    const initial = createShadRoot(root, [], { ...config, initial: true, start: 0 }, concurrency);

    expect(initial.root).toBe(root);

    expect(concurrency.count(0)).toBe(0);

    const appended = createShadRoot(
      paragraph('Hello world'),
      initial.characters,
      { ...config, start: 1000 },
      concurrency,
    );

    expect(describeFades(appended.root)).toEqual([{ text: ' world', start: 1000, duration: 400 }]);
  });

  test('keeps each batch on its own clock and settles it after its duration', () => {
    const concurrency = new FadeConcurrency();

    const first = createShadRoot(paragraph('ab'), [], { ...config, start: 0 }, concurrency);

    const second = createShadRoot(
      paragraph('abcd'),
      first.characters,
      { ...config, start: 100 },
      concurrency,
    );

    expect(describeFades(second.root)).toEqual([
      { text: 'ab', start: 0, duration: 400 },
      { text: 'cd', start: 100, duration: 400 },
    ]);

    const later = createShadRoot(
      paragraph('abcd'),
      second.characters,
      { ...config, start: 450 },
      concurrency,
    );

    expect(describeFades(later.root)).toEqual([{ text: 'cd', start: 100, duration: 400 }]);
  });

  test('shares concurrency across roots, so busy streams fade faster', () => {
    const concurrency = new FadeConcurrency();

    createShadRoot(paragraph('0123456789'), [], { ...config, start: 0 }, concurrency);

    const other = createShadRoot(
      paragraph('abcdefghij'),
      [],
      { ...config, start: 50 },
      concurrency,
    );

    expect(describeFades(other.root)).toEqual([{ text: 'abcdefghij', start: 50, duration: 200 }]);
  });

  test('keeps the duration a character started with when settings change', () => {
    const concurrency = new FadeConcurrency();

    const first = createShadRoot(paragraph('ab'), [], { ...config, start: 0 }, concurrency);

    const retuned = createShadRoot(
      paragraph('ab'),
      first.characters,
      { ...config, duration: 100, start: 50 },
      concurrency,
    );

    expect(describeFades(retuned.root)).toEqual([{ text: 'ab', start: 0, duration: 400 }]);
  });

  test('disables the fade for a zero length', () => {
    const concurrency = new FadeConcurrency();

    const root = paragraph('abc');

    const result = createShadRoot(root, [], { ...config, length: 0, start: 0 }, concurrency);

    expect(result.root).toBe(root);

    expect(concurrency.count(0)).toBe(0);
  });

  test('leaves code and formulas whole', () => {
    const concurrency = new FadeConcurrency();

    const root: HastRoot = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: {},
              children: [{ type: 'text', value: 'x' }],
            },
            { type: 'text', value: 'y' },
          ],
        },
      ],
    };

    const result = createShadRoot(root, [], { ...config, start: 0 }, concurrency);

    expect(describeFades(result.root)).toEqual([{ text: 'y', start: 0, duration: 400 }]);
  });
});
