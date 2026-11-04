import type { Element, Root as HastRoot } from 'hast';

import { sizeOfHast } from '@fluxdown/hast';

import { createScaleRoot, SCALE_DATA_ATTR } from '..';
import { restoreGlobals, stubGlobal } from '../../../../../../../../scripts/testing/globals';

const config = { initial: false, start: 1000, duration: 200, from: 0, blur: 2 };

const paragraph = (value: string): HastRoot => ({
  type: 'root',
  children: [
    { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value }] },
  ],
});

const readCharacters = (root: HastRoot): Element[] => {
  const result: Element[] = [];

  const visit = (parent: HastRoot | Element) => {
    for (const child of parent.children) {
      if (child.type !== 'element') {
        continue;
      }

      if (child.properties[SCALE_DATA_ATTR] === 'char') {
        result.push(child);
      }

      visit(child);
    }
  };

  visit(root);

  return result;
};

test('keeps initial content untouched and only timestamps appended graphemes', () => {
  const root = paragraph('Hello');

  const initial = createScaleRoot(root, [], { ...config, initial: true });

  expect(initial.root).toBe(root);

  const appended = createScaleRoot(paragraph('Hello world'), initial.characters, config);

  expect(readCharacters(appended.root)).toHaveLength(5);

  expect(appended.characters.slice(0, 5).every(({ start }) => start === -1)).toBe(true);

  expect(
    readCharacters(appended.root).every((node) => node.properties.dataScaleStart === 1000),
  ).toBe(true);

  const next = createScaleRoot(paragraph('Hello worlds'), appended.characters, {
    ...config,
    start: 1050,
  });

  expect(readCharacters(next.root).map((node) => node.properties.dataScaleStart)).toEqual([
    1000, 1000, 1000, 1000, 1000, 1050,
  ]);

  expect(sizeOfHast(next.root)).toBe(sizeOfHast(paragraph('Hello worlds')));
});

test('preserves grapheme clusters, whitespace, and inline Markdown structure', () => {
  const root: HastRoot = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'strong',
        properties: {},
        children: [{ type: 'text', value: '👨‍👩‍👧‍👦 e\u0301 中文\nnext' }],
      },
    ],
  };

  const result = createScaleRoot(root, [], config);

  expect(readCharacters(result.root).map((node) => node.children)).toContainEqual([
    { type: 'text', value: '👨‍👩‍👧‍👦' },
  ]);

  expect(readCharacters(result.root).map((node) => node.children)).toContainEqual([
    { type: 'text', value: 'e\u0301' },
  ]);

  expect(result.root.children[0]).toMatchObject({ tagName: 'strong' });

  expect(sizeOfHast(result.root)).toBe(sizeOfHast(root));
});

test('retains entrance times across formatting changes and truncates history after edits', () => {
  const initial = createScaleRoot(paragraph('abc'), [], config);

  const formatted: HastRoot = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'em',
        properties: {},
        children: [{ type: 'text', value: 'abc' }],
      },
    ],
  };

  const updated = createScaleRoot(formatted, initial.characters, { ...config, start: 1200 });

  expect(updated.characters).toEqual(initial.characters);

  const replaced = createScaleRoot(paragraph('ax'), updated.characters, { ...config, start: 1300 });

  expect(replaced.characters).toEqual([
    { text: 'a', start: 1000 },
    { text: 'x', start: 1300 },
  ]);

  const cleared = createScaleRoot(paragraph(''), replaced.characters, config);

  expect(cleared.characters).toEqual([]);
});

test('retains a visible suffix when Markdown delimiters disappear during reparsing', () => {
  const initial = createScaleRoot(paragraph('*hello'), [], config);

  const repaired = createScaleRoot(paragraph('hello'), initial.characters, {
    ...config,
    start: 1200,
  });

  expect(repaired.characters).toEqual(initial.characters.slice(1));

  const inserted = createScaleRoot(paragraph('well hello'), repaired.characters, {
    ...config,
    start: 1300,
  });

  expect(inserted.characters.slice(5)).toEqual(repaired.characters);

  expect(inserted.characters.slice(0, 5).every(({ start }) => start === 1300)).toBe(true);
});

test('collapses settled words into one text prefix while retaining the active entrance window', () => {
  const initial = createScaleRoot(paragraph('old words'), [], config);

  const root = paragraph('old words fresh');

  const appended = createScaleRoot(root, initial.characters, { ...config, start: 1199 });

  expect(readCharacters(appended.root)).toHaveLength(13);

  const settled = createScaleRoot(root, appended.characters, { ...config, start: 1200 });

  const parent = settled.root.children[0] as Element;

  expect(parent.children).toHaveLength(2);

  expect(parent.children[0]).toEqual({ type: 'text', value: 'old words ' });

  expect(readCharacters(settled.root).map((node) => node.children)).toEqual(
    Array.from('fresh', (value) => [{ type: 'text', value }]),
  );

  expect(sizeOfHast(settled.root)).toBe(sizeOfHast(root));

  expect(settled.characters).toEqual(appended.characters);

  const finished = createScaleRoot(root, settled.characters, { ...config, start: 1399 });

  expect(finished.root).toBe(root);

  expect(finished.characters).toEqual(appended.characters);

  const continued = createScaleRoot(paragraph('old words fresh next'), finished.characters, {
    ...config,
    start: 1500,
  });

  expect(readCharacters(continued.root).map((node) => node.children)).toEqual(
    Array.from('next', (value) => [{ type: 'text', value }]),
  );

  expect((continued.root.children[0] as Element).children[0]).toEqual({
    type: 'text',
    value: 'old words fresh ',
  });

  expect(sizeOfHast(continued.root)).toBe(sizeOfHast(paragraph('old words fresh next')));

  expect(continued.characters.slice(0, finished.characters.length)).toEqual(finished.characters);
});

test('keeps generated word and character keys stable when settled siblings collapse', () => {
  const initial = createScaleRoot(paragraph('same same'), [], config);

  const root = paragraph('same same same');

  const appended = createScaleRoot(root, initial.characters, { ...config, start: 1199 });

  const settled = createScaleRoot(root, appended.characters, { ...config, start: 1200 });

  const before = (appended.root.children[0] as Element).children.filter(
    (node): node is Element => node.type === 'element',
  );

  const after = (settled.root.children[0] as Element).children[1] as Element;

  expect(new Set(before.map((node) => node.data?.renderKey)).size).toBe(3);

  expect(after.data?.renderKey).toBe(before[2]?.data?.renderKey);

  expect(after.children.map((node) => node.data?.renderKey)).toEqual(
    before[2]?.children.map((node) => node.data?.renderKey),
  );

  const characters = readCharacters(appended.root);

  expect(new Set(characters.map((node) => node.data?.renderKey)).size).toBe(characters.length);

  expect(characters.every((node) => !('renderKey' in node.properties))).toBe(true);
});

test('keeps punctuation attached to words and normalizes invalid animation values', () => {
  const result = createScaleRoot(paragraph('hello, world! 中文，测试。'), [], {
    ...config,
    duration: Number.NaN,
    from: 2,
    blur: Number.NaN,
  });

  const paragraphNode = result.root.children[0] as Element;

  const words = paragraphNode.children.filter((node): node is Element => node.type === 'element');

  expect(
    words.map((word) =>
      word.children
        .map((child) =>
          (child as Element).children
            .map((node) => (node.type === 'text' ? node.value : ''))
            .join(''),
        )
        .join(''),
    ),
  ).toEqual(['hello,', 'world!', '中', '文，', '测', '试。']);

  expect(readCharacters(result.root)[0]?.properties).toMatchObject({
    dataScaleDuration: 200,
    dataScaleFrom: 1,
    dataScaleBlur: 0.08,
  });
});

test('keeps zero-duration entrances as plain text', () => {
  const root = paragraph('instant');

  const result = createScaleRoot(root, [], { ...config, duration: -1 });

  expect(result.root).toBe(root);

  expect(readCharacters(result.root)).toEqual([]);
});

test.each([
  ['Intl.Segmenter', {}],
  ['Intl', undefined],
] as const)('preserves CJK word boundaries and entrance keys without %s', async (_name, intl) => {
  const root = paragraph('Hello, 中文，world! 「测试」 한국어。 かなカナ');

  const segmented = createScaleRoot(root, [], config);

  const appendedRoot = paragraph('Hello, 中文，world! 「测试」 한국어。 かなカナ 每个文字');

  const appended = createScaleRoot(appendedRoot, segmented.characters, {
    ...config,
    start: 1200,
  });

  try {
    stubGlobal('Intl', intl);

    jest.resetModules();

    const { createScaleRoot: createWithoutSegmenter } = await import('..');

    const fallback = createWithoutSegmenter(root, [], config);

    expect(fallback).toEqual(segmented);

    expect(
      createWithoutSegmenter(appendedRoot, fallback.characters, { ...config, start: 1200 }),
    ).toEqual(appended);
  } finally {
    restoreGlobals();

    jest.resetModules();
  }
});

test.each([
  ['code', {}],
  ['pre', {}],
  ['svg', {}],
  ['script', {}],
  ['span', { dataType: 'inline-math' }],
  ['span', { dataParserPatch: '1' }],
] as const)('keeps opaque %s nodes untouched', (tagName, properties) => {
  const root: HastRoot = {
    type: 'root',
    children: [
      { type: 'element', tagName, properties, children: [{ type: 'text', value: 'opaque' }] },
    ],
  };

  const result = createScaleRoot(root, [], config);

  expect(result.root).toBe(root);

  expect(result.characters).toEqual([]);
});
