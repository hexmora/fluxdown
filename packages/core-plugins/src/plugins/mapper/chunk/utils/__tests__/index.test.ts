import type { Element, Root as HastRoot, RootContent } from 'hast';

import { sizeOfHast } from '@fluxdown/hast';

import { CHUNK_DATA_ATTR, createChunkRoot } from '..';

const config = { initial: false, start: 1000, duration: 400 };

const paragraph = (value: string): HastRoot => ({
  type: 'root',
  children: [
    { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value }] },
  ],
});

const readChunks = (node: HastRoot | RootContent): Element[] => {
  if (node.type === 'element' && node.properties[CHUNK_DATA_ATTR] === '1') {
    return [node];
  }

  return 'children' in node ? node.children.flatMap(readChunks) : [];
};

const readText = (node: HastRoot | RootContent): string =>
  node.type === 'text'
    ? node.value
    : 'children' in node
      ? node.children.map(readText).join('')
      : '';

test('groups each incoming batch into one inline span, including whitespace and graphemes', () => {
  const root = paragraph('Hello');
  const initial = createChunkRoot(root, [], { ...config, initial: true });

  expect(initial.root).toBe(root);

  const appended = createChunkRoot(
    paragraph('Hello 👨‍👩‍👧‍👦 e\u0301 中文\nnext'),
    initial.characters,
    config,
  );

  expect(readChunks(appended.root).map(readText)).toEqual([' 👨‍👩‍👧‍👦 e\u0301 中文\nnext']);
  expect(readChunks(appended.root)[0]?.properties).toMatchObject({
    dataChunkStart: 1000,
    dataChunkDuration: 400,
  });
  expect(sizeOfHast(appended.root)).toBe(sizeOfHast(paragraph('Hello 👨‍👩‍👧‍👦 e\u0301 中文\nnext')));

  const next = createChunkRoot(
    paragraph('Hello 👨‍👩‍👧‍👦 e\u0301 中文\nnext chunk'),
    appended.characters,
    {
      ...config,
      start: 1100,
    },
  );

  expect(readChunks(next.root).map(readText)).toEqual([' 👨‍👩‍👧‍👦 e\u0301 中文\nnext', ' chunk']);
  expect(readChunks(next.root).map((node) => node.properties.dataChunkStart)).toEqual([1000, 1100]);
});

test.each(['ul', 'ol'])('keeps %s structural whitespace outside animation spans', (tagName) => {
  const list: Element = {
    type: 'element',
    tagName,
    properties: {},
    children: [
      { type: 'text', value: '\n' },
      {
        type: 'element',
        tagName: 'li',
        properties: {},
        children: [{ type: 'text', value: 'First' }],
      },
      { type: 'text', value: '\n' },
      {
        type: 'element',
        tagName: 'li',
        properties: {},
        children: [{ type: 'text', value: 'Second' }],
      },
      { type: 'text', value: '\n' },
    ],
  };

  const root: HastRoot = { type: 'root', children: [list] };

  const active = createChunkRoot(root, [], config);

  const activeList = active.root.children[0] as Element;

  for (const index of [0, 2, 4]) {
    expect(activeList.children[index]).toBe(list.children[index]);
  }

  expect(readChunks(active.root).map(readText)).toEqual(['First', 'Second']);
  expect(readText(active.root)).toBe('\nFirst\nSecond\n');
  expect(active.characters.map(({ text }) => text).join('')).toBe(readText(root));
  expect(active.characters.every(({ start }) => start === 1000)).toBe(true);

  const settled = createChunkRoot(root, active.characters, { ...config, start: 1400 });

  expect(settled.root).toBe(root);
  expect(readText(settled.root)).toBe(readText(active.root));
});

test('preserves standalone whitespace and its offsets between animated inline words', () => {
  const space = { type: 'text', value: ' \t ' } as const;

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
            tagName: 'strong',
            properties: {},
            children: [{ type: 'text', value: 'one' }],
          },
          space,
          {
            type: 'element',
            tagName: 'em',
            properties: {},
            children: [{ type: 'text', value: 'two' }],
          },
        ],
      },
    ],
  };

  const active = createChunkRoot(root, [], config);

  expect((active.root.children[0] as Element).children[1]).toBe(space);
  expect(readText(active.root)).toBe('one \t two');
  expect(readChunks(active.root).map(readText)).toEqual(['one', 'two']);

  const appended = createChunkRoot(paragraph('one \t two three'), active.characters, {
    ...config,
    start: 1100,
  });

  expect(readChunks(appended.root).map(readText)).toEqual(['one \t two', ' three']);
  expect(readChunks(appended.root).map((node) => node.properties.dataChunkStart)).toEqual([
    1000, 1100,
  ]);
});

test('preserves literal paragraph newlines while only animating visible text', () => {
  const blank = paragraph('\n\n');

  const activeBlank = createChunkRoot(blank, [], config);

  expect(activeBlank.root).toBe(blank);
  expect(readText(activeBlank.root)).toBe('\n\n');
  expect(activeBlank.characters).toHaveLength(2);

  const content = createChunkRoot(paragraph('first\nsecond\n'), [], config);

  expect(readText(content.root)).toBe('first\nsecond\n');
  expect(readChunks(content.root).map(readText)).toEqual(['first\nsecond\n']);
});

test('preserves batch start times across inline Markdown reparsing and delimiter removal', () => {
  const initial = createChunkRoot(paragraph('*hello world'), [], config);
  const formatted: HastRoot = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'em',
            properties: {},
            children: [{ type: 'text', value: 'hello' }],
          },
          { type: 'text', value: ' world' },
        ],
      },
    ],
  };
  const reparsed = createChunkRoot(formatted, initial.characters, { ...config, start: 1100 });

  expect(readChunks(reparsed.root).map(readText)).toEqual(['hello', ' world']);
  expect(readChunks(reparsed.root).map((node) => node.properties.dataChunkStart)).toEqual([
    1000, 1000,
  ]);
  expect(readText(reparsed.root)).toBe('hello world');
  expect(sizeOfHast(reparsed.root)).toBe(sizeOfHast(formatted));
});

test('collapses settled batches and never revives them when duration increases', () => {
  const first = createChunkRoot(paragraph('old'), [], config);
  const appended = createChunkRoot(paragraph('old fresh'), first.characters, {
    ...config,
    start: 1300,
  });
  const settled = createChunkRoot(paragraph('old fresh next'), appended.characters, {
    ...config,
    start: 1450,
    duration: 2000,
  });

  expect((settled.root.children[0] as Element).children[0]).toEqual({ type: 'text', value: 'old' });
  expect(
    readChunks(settled.root).map((node) => [readText(node), node.properties.dataChunkDuration]),
  ).toEqual([
    [' fresh', 400],
    [' next', 2000],
  ]);

  const root = paragraph('old fresh next');
  const finished = createChunkRoot(root, settled.characters, {
    ...config,
    start: 3500,
    duration: 5000,
  });

  expect(finished.root).toBe(root);
  expect(finished.characters.every(({ start }) => start === -1)).toBe(true);
});

test('tracks replacements and clears history when content is deleted', () => {
  const initial = createChunkRoot(paragraph('abc'), [], config);
  const replaced = createChunkRoot(paragraph('axc'), initial.characters, {
    ...config,
    start: 1100,
  });

  expect(replaced.characters.map(({ start }) => start)).toEqual([1000, 1100, 1000]);
  expect(readChunks(replaced.root).map(readText)).toEqual(['a', 'x', 'c']);

  const empty = createChunkRoot(paragraph(''), replaced.characters, { ...config, start: 1200 });
  expect(empty.characters).toEqual([]);

  const restarted = createChunkRoot(paragraph('a'), empty.characters, { ...config, start: 1300 });
  expect(readChunks(restarted.root)[0]?.properties.dataChunkStart).toBe(1300);
});

test.each([-1, 0, Number.NaN, Number.POSITIVE_INFINITY])('normalizes duration %s', (duration) => {
  const root = paragraph('hello');
  const result = createChunkRoot(root, [], { ...config, duration });

  if (duration <= 0) {
    expect(result.root).toBe(root);
  } else {
    expect(readChunks(result.root)[0]?.properties.dataChunkDuration).toBe(400);
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
  const result = createChunkRoot(root, [], config);

  expect(result.root).toBe(root);
  expect(result.characters).toEqual([]);
});
