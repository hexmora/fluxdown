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
