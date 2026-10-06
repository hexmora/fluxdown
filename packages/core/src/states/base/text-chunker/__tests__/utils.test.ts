import type { IRawPatchItem } from '@fluxdown/types';

import { expectTypeOf } from 'expect-type';
import { cloneDeep } from 'lodash-es';
import { batch, type IReactiveState, MutableState, render, S } from 'stative';

import { countStateObservers } from '../../../../../../../scripts/testing/state';
import { type IBlockSection, TextChunker } from '../index';
import { type ChunkedPatch, chunkPatchesByTexts } from '../utils';
import { LexerChunker } from '../utils/chunker';

type ChunkCase = {
  name: string;
  text: string;
  expected: string[];
};

const chunks = (name: string, ...expected: string[]): ChunkCase => ({
  name,
  text: expected.join(''),
  expected,
});

const expectChunks = (text: string, expected: string[]) => {
  const result = new LexerChunker().chunk(text);

  expect(result).toEqual(expected);
  expect(result.join('')).toBe(text);

  if (text.trim() !== '') {
    expect(result.every((chunk) => chunk.trim() !== '')).toBe(true);
  }
};

const getObserverCount = countStateObservers;

const TABLE = `| a | b |
| - | - |
| 1 | 2 |
`;

const MARKDOWN_CASES: ChunkCase[] = [
  chunks('returns no chunks for empty input'),
  chunks('keeps a whitespace-only document intact', '\n\n'),
  chunks('attaches leading blank lines to the first block', '\n\npara\n'),
  chunks('keeps a soft break in its paragraph', 'line 1\nline 2\n'),
  chunks('attaches separating blank lines to the preceding paragraph', 'para 1\n\n', 'para 2\n'),
  chunks('splits ordinary root blocks', '# Title\n\n', 'Para with **bold**.\n\n', 'Next line.\n'),
  chunks('splits an ATX heading from a following list', '# Title\n', '- a\n- b\n'),
  chunks('keeps a Setext heading intact', 'Title\n---\n', 'after\n'),
  chunks('keeps an equals Setext heading intact', 'Title\n===\n'),
  chunks('does not mistake a pipe in a Setext heading for a table', 'a | b\n---\n', 'after\n'),
  chunks('recognizes a standalone dash thematic break', '---\n'),
  chunks('recognizes a standalone thematic break', '***\n'),
  chunks('recognizes a spaced thematic break', '- - -\n'),
  chunks('follows the Setext interpretation of an ambiguous dash line', 'before\n---\n', 'after\n'),
  chunks('keeps unclosed three-dollar math through EOF', '$$$\n# Heading\n'),
  chunks('keeps lazy continuation text in an unordered list', '- a\n- b\nafter\n'),
  chunks('keeps lazy continuation text in an ordered list', '1. a\n2. b\nafter\n'),
  chunks('keeps a non-one ordered list and its lazy continuation together', '2. a\n3. b\nafter\n'),
  chunks('keeps lazy continuation text in a task list', '- [x] done\nafter\n'),
  chunks('splits a paragraph after a blank line from its list', '- a\n- b\n\n', 'after\n'),
  chunks('splits adjacent lists with different markers', '- a\n- b\n', '1. c\n2. d\n'),
  chunks('preserves trailing spaces in an EOF list', 'before\n\n', '- first\n- second '),
  chunks('preserves an unfinished list marker at EOF', 'before\n\n', '- first\n- '),
  chunks('preserves trailing tabs in an ordered list', 'before\n\n', '1. first\n2. second\t '),
  chunks('preserves trailing spaces in a nested list', 'before\n\n', '- first\n  - nested  '),
  chunks(
    'preserves trailing spaces in lazy list continuation',
    'before\n\n',
    '- first\nlazy continuation ',
  ),
  chunks('preserves a Setext heading inside an EOF list', 'before\n\n', '- first\n  Title\n  --- '),
  chunks('preserves indented code inside an EOF list', 'before\n\n', '- first\n\n      code '),
  chunks(
    'preserves CRLF and trailing whitespace in an EOF list',
    'before\r\n\r\n',
    '- first\r\n- second \t',
  ),
  chunks(
    'keeps whitespace before a following block with its list',
    'before\n\n',
    '- first\n- second \n\n',
    'after\n',
  ),
  chunks(
    'keeps table-like lines inside their list item',
    '- item\n  | a | b |\n  | - | - |\n  | 1 | 2 |\n  after\n',
  ),
  chunks('keeps a blockquote atomic', '> quote\n> tail\n'),
  chunks('splits content after a blockquote', '> para 1\n>\n> para 2\n\n', 'after\n'),
  chunks(
    'keeps fenced code inside a list item',
    "- item\n\n  ```js\n  console.log('a');\n  ```\n\n  tail\n",
  ),
  chunks(
    'keeps fenced code inside a blockquote',
    "> quote\n>\n> ```js\n> console.log('a');\n> ```\n>\n> tail\n",
  ),
  chunks('keeps an unclosed code fence through EOF', '```js\nconsole.log(1);\n'),
  chunks('supports tilde code fences', '~~~txt\nhi\n~~~\n'),
  chunks(
    'does not close a long fence with a shorter fence',
    "````md\n```js\nconsole.log('inner');\n```\n````\n",
    'after\n',
  ),
  chunks('splits consecutive code fences', '```txt\na\n```\n', '```txt\nb\n```\n'),
  chunks('splits text after a code fence without a blank line', '```txt\na\n```\n', 'after\n'),
  chunks(
    'splits a heading after a code fence without a blank line',
    '```txt\na\n```\n',
    '# Next\n',
  ),
  chunks('splits a list after a code fence without a blank line', '```txt\na\n```\n', '- item\n'),
  chunks(
    'splits a blockquote after a code fence without a blank line',
    '```txt\na\n```\n',
    '> quote\n',
  ),
  chunks('keeps indented code intact', '    code\n    line\n'),
  chunks('keeps a compact HTML block intact', '<div>\n<span>hi</span>\n</div>\n'),
  chunks('splits content after an HTML block', '<div>\n<span>hi</span>\n</div>\n\n', 'after\n'),
  chunks('keeps blank lines inside a pre block', '<pre>\nline 1\n\nline 2\n</pre>\n', 'after\n'),
  chunks(
    'keeps blank lines inside a script block',
    '<script>\nconst value = 1;\n\nconsole.log(value);\n</script>\n',
    'after\n',
  ),
  chunks('keeps blank lines inside a style block', '<style>\na|b\n\nc|d\n</style>\n', 'after\n'),
  chunks('splits content after an HTML comment', '<!-- a|b -->\n', 'after\n'),
  chunks(
    'keeps a generic HTML container together across blank lines',
    '<div class="a">\nline 1\n\nline 2\n</div>\nafter\n',
  ),
  chunks(
    'keeps a custom HTML container together across blank lines',
    '<my-custom-tag>\nline 1\n\nline 2\n</my-custom-tag>\nafter\n',
  ),
  chunks(
    'keeps nested custom HTML containers together',
    '<my-custom-tag>\n<my-custom-tag>\ninner\n</my-custom-tag>\n\nouter\n</my-custom-tag>\nafter\n',
  ),
  chunks('keeps unknown block syntax under marked paragraph semantics', ':::tip\nhi\n:::\n'),
  chunks('preserves CRLF line endings', '# Title\r\n\r\n', 'paragraph\r\n'),
];

const TABLE_CASES: ChunkCase[] = [
  chunks('keeps a GFM table intact', TABLE),
  chunks(
    'preserves table alignment and escaped pipes',
    '| a \\| b | c |\n| :-- | --: |\n| 1   | 2   |\n',
  ),
  chunks('recognizes a table after a paragraph without a blank line', 'before\n', TABLE),
  chunks('keeps plain text without a blank line in the table body', `${TABLE}after\n`),
  chunks('stops a table before an ATX heading', TABLE, '# Next | Pipe\n'),
  chunks('stops a table before a list', TABLE, '- item | pipe\n'),
  chunks('stops a table before a non-one ordered list', TABLE, '2. item | pipe\n'),
  chunks('stops a table before a blockquote', TABLE, '> | q | w |\n> | - | - |\n'),
  chunks('stops a table before a fenced code block', TABLE, '```txt\na | b\n```\n'),
  chunks('stops a table before an indented code block', TABLE, '    a | b\n'),
  chunks('stops a table before a thematic break', TABLE, '---\n'),
  chunks('attaches a separating blank line to the table', `${TABLE}\n`, 'after\n'),
  chunks('stops a table before an HTML block', TABLE, '<pre>| x | y |</pre>\n\n', 'after\n'),
  chunks('supports tables without outer pipes', 'a | b\n--- | ---\n1 | 2\nafter\n'),
  chunks('allows body rows with fewer cells', '| a | b |\n| - | - |\n| 1 |\nafter\n'),
  chunks(
    'does not treat mismatched header and delimiter cells as a table',
    '| a | b |\n| - | - | - |\nafter\n',
  ),
  chunks(
    'preserves CRLF in a table and its following block',
    '| a | b |\r\n| - | - |\r\n| 1 | 2 |\r\n\r\n',
    'after\r\n',
  ),
];

const DISPLAY_MATH_CASES: ChunkCase[] = [
  chunks('keeps a dollar math block intact', '$$\nE = mc^2\n$$\n\n', 'Next para.\n'),
  chunks(
    'starts dollar math after a paragraph without a blank line',
    'before\n',
    '$$\na\n$$\n',
    'after\n',
  ),
  chunks('keeps unclosed dollar math through EOF', '$$\nE = mc^2\n'),
  chunks('supports a dollar closing delimiter at EOF', '$$\nE = mc^2\n$$'),
  chunks(
    'shields Setext and thematic-break-like lines in dollar math',
    '$$\na\n=\nb\n\nc\n---\nd\n$$\n\n',
    'after\n',
  ),
  chunks(
    'shields root Markdown syntax in dollar math',
    `$$
# not a heading

- not a list
1. not an ordered list

> not a quote

***

\`\`\`js
not a fence
\`\`\`

<div>not HTML</div>

[ref]: https://example.test

| a | b |
| - | - |
| 1 | 2 |
$$

`,
    'after\n',
  ),
  chunks(
    'does not close dollar math on escaped delimiters',
    '$$\nline 1\n\\$\\$\nline 2\n$$\n\n',
    'after\n',
  ),
  chunks(
    'allows up to three spaces before a dollar closing delimiter',
    '$$\na\n   $$\n',
    'after\n',
  ),
  chunks(
    'does not close dollar math on a four-space-indented delimiter',
    '$$\na\n    $$\nmore\n$$\n',
    'after\n',
  ),
  chunks(
    'accepts trailing spaces on a dollar closing delimiter',
    '$$\nE = mc^2\n$$   \n',
    'after\n',
  ),
  chunks('splits text immediately after dollar math', '$$\nE = mc^2\n$$\n', 'after\n'),
  chunks('recognizes dollar math indented by two spaces', '  $$\n  a + b\n  $$\n\n', 'Next\n'),
  chunks(
    'leaves four-space-indented dollar lines as code',
    '    $$\n    a + b\n    $$\n\n',
    'Next\n',
  ),
  chunks('leaves tab-indented dollar lines to marked', '\t$$\n\ta + b\n\t$$\n\n', 'Next\n'),
  chunks(
    'keeps multiple dollar math blocks independent',
    'Before\n\n',
    '$$\na\n$$\n\n',
    'Middle\n\n',
    '$$\nb\n---\nc\n$$\n\n',
    'After\n',
  ),
  chunks('supports a loose dollar opening', 'before\n\n', '$$a\n---\nb\n$$\n\n', 'after\n'),
  chunks('supports a same-line loose dollar span', '$$a||||aa$$\n'),
  chunks('supports a same-line loose dollar span at EOF', '$$a||||aa$$'),
  chunks('returns a same-line dollar span to marked', '$$a$$\nafter\n'),
  chunks('returns a loose span with trailing text to marked', '$$a||||aa$$xxxxx\n', '# Title\n'),
  chunks('keeps unclosed loose dollar math through EOF', '$$a\n---\nb\n'),
  chunks('does not treat inline dollars as display math', 'Text $$a$$ text\n'),
  chunks('does not tokenize dollars inside fenced code', '```md\n$$\na+b\n$$\n```\n\n', 'after\n'),
  chunks(
    'keeps dollar math inside its list container',
    '- item\n\n  $$\n  a\n  ---\n  b\n  $$\n\n',
    'end\n',
  ),
  chunks(
    'keeps dollar math inside its blockquote container',
    '> quote\n>\n> $$\n> a\n> ---\n> b\n> $$\n>\n> end\n',
  ),
  chunks('keeps a Pandoc math block intact', '\\[\na+b\n\\]\n'),
  chunks(
    'keeps adjacent paragraph text with inline Pandoc delimiters',
    'before\n\\[\na\n\\]\nafter\n',
  ),
  chunks(
    'shields Markdown-looking lines in Pandoc math',
    '\\[\na\n---\nb\n=\nc\n***\nd\n\\]\nafter\n',
  ),
  chunks('keeps unclosed Pandoc math through EOF', '\\[\na+b\n'),
  chunks('allows up to three spaces before a Pandoc closing delimiter', '\\[\na\n   \\]\nafter\n'),
  chunks(
    'does not close Pandoc math on a four-space-indented delimiter',
    '\\[\na\n    \\]\n\\]\nafter\n',
  ),
  chunks(
    'leaves four-space-indented Pandoc delimiters as code',
    '    \\[\n    a\n    \\]\n\n',
    'after\n',
  ),
  chunks('preserves CRLF in dollar math', '$$\r\na\r\n$$\r\n', 'after\r\n'),
  chunks('preserves CRLF in Pandoc math', '\\[\r\na\r\n\\]\r\nafter\r\n'),
];

const DOCUMENT_SCOPED_CASES: ChunkCase[] = [
  chunks(
    'retains document scope when an EOF list needs whitespace alignment',
    'before\n\n- first[^note] ',
  ),
  chunks(
    'falls back to one chunk for a footnote reference',
    'Here is a footnote[^1].\n\nNext paragraph.\n',
  ),
  chunks(
    'falls back to one chunk for a footnote definition',
    'Before.\n\n[^note]: footnote definition\n',
  ),
  chunks(
    'falls back to one chunk for a footnote reference and definition',
    'Here is a footnote[^1].\n\n[^1]: footnote definition\n',
  ),
  chunks(
    'falls back to one chunk for a reference link definition',
    '# Title\n\nRead [the reference][ref].\n\n[ref]: https://example.test "Example"\n',
  ),
  chunks(
    'ignores footnote-like syntax inside fenced code',
    '```md\n[^1]: not a footnote\n```\n\n',
    'after\n',
  ),
  chunks(
    'ignores footnote-like syntax inside inline code',
    'Before `[^1]: not a footnote` after.\n\n',
    'Next paragraph.\n',
  ),
  chunks(
    'ignores footnote-like syntax inside indented code',
    '    [^1]: not a footnote\n\n',
    'after\n',
  ),
  chunks(
    'ignores reference definitions inside fenced code',
    '```md\n[ref]: https://example.test "Example"\n```\n',
    'after\n',
  ),
  chunks(
    'ignores footnote-like syntax inside raw HTML',
    '<pre>\n[^1]: not a footnote\n</pre>\n',
    'after\n',
  ),
  chunks(
    'ignores reference definitions shielded by display math',
    '$$\n[ref]: https://example.test\n$$\n\n',
    'after\n',
  ),
  chunks(
    'ignores footnote-like syntax shielded by display math',
    '$$\n[^1]: not a footnote\n$$\n\n',
    'after\n',
  ),
  chunks('ignores escaped footnote references', 'Escaped \\[^1].\n\n', 'Next paragraph.\n'),
  chunks(
    'ignores invalid footnote labels containing spaces',
    'Literal [^not a footnote].\n\n',
    'Next paragraph.\n',
  ),
  chunks(
    'ignores footnote-like syntax inside an autolink',
    '<https://example.test/[^1]>\n\n',
    'Next paragraph.\n',
  ),
  chunks(
    'ignores footnote-like syntax inside a link label',
    '[label [^1]](https://example.test)\n\n',
    'Next paragraph.\n',
  ),
  chunks(
    'keeps definition-looking text in the table body',
    `${TABLE}[ref]: https://example.test/a|b\n\n`,
    'Use [the reference][ref].\n',
  ),
];

describe('LexerChunker', () => {
  test.each(MARKDOWN_CASES)('$name', ({ text, expected }) => {
    expectChunks(text, expected);
  });

  test('preserves completed blocks while appending to an EOF list', () => {
    const prefix = ['# Title\n\n', 'before\n\n', TABLE + '\n'];
    const list = '- first item with **strong** and *emphasis*\n- second item ';

    for (let length = 2; length <= list.length; length += 1) {
      const tail = list.slice(0, length);

      expectChunks(prefix.join('') + tail, [...prefix, tail]);
    }
  });

  describe('GFM tables', () => {
    test.each(TABLE_CASES)('$name', ({ text, expected }) => {
      expectChunks(text, expected);
    });
  });

  describe('display math', () => {
    test.each(DISPLAY_MATH_CASES)('$name', ({ text, expected }) => {
      expectChunks(text, expected);
    });
  });

  describe('document-scoped syntax', () => {
    test.each(DOCUMENT_SCOPED_CASES)('$name', ({ text, expected }) => {
      expectChunks(text, expected);
    });
  });
});

describe('chunkPatchesByTexts', () => {
  test('returns block-aligned local patch ranges', () => {
    expect(
      chunkPatchesByTexts(
        [
          { key: 'first', range: 1 },
          { key: 'second', range: [7, 9] },
        ],
        ['first\n', 'second'],
      ),
    ).toEqual([[{ key: 'first', range: [1, 1] }], [{ key: 'second', range: [1, 3] }]]);
  });

  test('assigns boundary and EOF insertion points to the following and final blocks', () => {
    expect(
      chunkPatchesByTexts(
        [
          { key: 'boundary', range: 3 },
          { key: 'eof', range: 6 },
        ],
        ['abc', 'def'],
      ),
    ).toEqual([
      [],
      [
        { key: 'boundary', range: [0, 0] },
        { key: 'eof', range: [3, 3] },
      ],
    ]);
  });

  test('discards invalid and cross-block ranges', () => {
    expect(
      chunkPatchesByTexts(
        [
          { key: 'negative', range: [-1, 1] },
          { key: 'reversed', range: [2, 1] },
          { key: 'overflow', range: [0, 7] },
          { key: 'not-a-number', range: Number.NaN },
          { key: 'fractional', range: 1.5 },
          { key: 'cross-block', range: [2, 4] },
        ],
        ['abc', 'def'],
      ),
    ).toEqual([[], []]);
  });

  test('sorts patches and removes conflicts while preserving equal points', () => {
    expect(
      chunkPatchesByTexts(
        [
          { key: 'right', range: [3, 5] },
          { key: 'left', range: [0, 2] },
          { key: 'overlap', range: [1, 4] },
          { key: 'point-a', range: 2 },
          { key: 'point-b', range: 2 },
        ],
        ['abcdef'],
      ),
    ).toEqual([
      [
        { key: 'left', range: [0, 2] },
        { key: 'point-a', range: [2, 2] },
        { key: 'point-b', range: [2, 2] },
        { key: 'right', range: [3, 5] },
      ],
    ]);
  });

  test('resolves conflicts between insertion points and replacements', () => {
    expect(
      chunkPatchesByTexts(
        [
          { key: 'replacement', range: [1, 4] },
          { key: 'inside', range: 2 },
        ],
        ['abcdef'],
      ),
    ).toEqual([[{ key: 'replacement', range: [1, 4] }]]);
    expect(
      chunkPatchesByTexts(
        [
          { key: 'replacement', range: [2, 4] },
          { key: 'point', range: 2 },
        ],
        ['abcdef'],
      ),
    ).toEqual([[{ key: 'point', range: [2, 2] }]]);
  });

  test('uses UTF-16 offsets without mutating the input', () => {
    const patches: IRawPatchItem[] = [{ key: 'line-ending', range: [2, 4] }];
    const original = cloneDeep(patches);

    expect(chunkPatchesByTexts(patches, ['🙂', '\r\nx'])).toEqual([
      [],
      [{ key: 'line-ending', range: [0, 2] }],
    ]);
    expect(patches).toEqual(original);
  });

  test('preserves extended patch fields and their types', () => {
    type ExtendedPatch = IRawPatchItem & {
      order: string;
      payload: number;
    };

    const patches: ExtendedPatch[] = [{ key: 'extended', range: 1, order: 'public', payload: 42 }];
    const result = chunkPatchesByTexts(patches, ['text']);

    expectTypeOf(result).toEqualTypeOf<ChunkedPatch<ExtendedPatch>[][]>();
    expect(result).toEqual([[{ key: 'extended', range: [1, 1], order: 'public', payload: 42 }]]);
  });

  test('keeps its output aligned with empty blocks and documents', () => {
    expect(chunkPatchesByTexts([], ['', 'value'])).toEqual([[], []]);
    expect(chunkPatchesByTexts([{ key: 'ignored', range: 0 }], [])).toEqual([]);
  });
});

describe('TextChunker', () => {
  test('reuses unchanged sections while keeping empty patch arrays independent', () => {
    const text = MutableState.of('alpha\n\ntail');

    const patches = MutableState.of<IRawPatchItem[]>([]);

    const closure = render(S([TextChunker, { text, patches }]));

    const initial = closure.value.value;

    text.next('alpha\n\nlonger tail');

    const updated = closure.value.value;

    expect(updated[0]).toBe(initial[0]);

    expect(updated[1]).not.toBe(initial[1]);

    expect(updated[0]?.patches).not.toBe(updated[1]?.patches);

    initial[0]?.patches.push({ key: 'external', range: 0 });

    expect(updated[1]?.patches).toEqual([]);

    patches.next([]);

    const restored = closure.value.value;

    expect(restored[0]).not.toBe(updated[0]);

    expect(restored[0]?.patches).toEqual([]);

    expect(restored[1]).toBe(updated[1]);

    closure.destroy();

    text.destroy();

    patches.destroy();
  });

  test('projects mutable patch ranges into independent snapshots before comparing sections', () => {
    const text = MutableState.of('a\n\ndef');

    const range: [number, number] = [4, 5];

    const patches = MutableState.of<IRawPatchItem[]>([{ key: 'patch', range }]);

    const closure = render(S([TextChunker, { text, patches }]));

    const initial = closure.value.value;

    expect(initial[1]?.patches).toEqual([{ key: 'patch', range: [1, 2] }]);

    expect(initial[1]?.patches[0]?.range).not.toBe(range);

    range[0] = 3;

    range[1] = 4;

    patches.next([...patches.value]);

    const updated = closure.value.value;

    expect(updated[0]).toBe(initial[0]);

    expect(updated[1]).not.toBe(initial[1]);

    expect(updated[1]?.patches).toEqual([{ key: 'patch', range: [0, 1] }]);

    expect(initial[1]?.patches).toEqual([{ key: 'patch', range: [1, 2] }]);

    range[0] = 2;

    patches.next([...patches.value]);

    const crossed = closure.value.value;

    expect(crossed[0]).toBe(updated[0]);

    expect(crossed[1]).not.toBe(updated[1]);

    expect(crossed[1]?.patches).toEqual([]);

    expect(updated[1]?.patches).toEqual([{ key: 'patch', range: [0, 1] }]);

    closure.destroy();

    text.destroy();

    patches.destroy();
  });

  test('retains unchanged sections across appends, replacements, and removals', () => {
    const text = MutableState.of('# Stable\n\ntail\n');

    const patches = MutableState.of<IRawPatchItem[]>([]);

    const closure = render(S([TextChunker, { text, patches }]));

    const initial = closure.value.value;

    text.next('# Stable\n\nlonger tail\n');

    const updated = closure.value.value;

    expect(updated[0]).toBe(initial[0]);

    expect(updated[1]).not.toBe(initial[1]);

    text.next('# Stable\n\nlonger tail\n\n# Last\n');

    const appended = closure.value.value;

    expect(appended).toHaveLength(3);

    expect(appended[0]).toBe(initial[0]);

    text.next('# Stable\n\nreplacement\n');

    expect(closure.value.value).toEqual([
      { text: '# Stable\n\n', patches: [] },
      { text: 'replacement\n', patches: [] },
    ]);

    expect(closure.value.value[0]).toBe(initial[0]);

    expect(closure.value.value[1]).not.toBe(appended[1]);

    closure.destroy();

    text.destroy();

    patches.destroy();
  });

  test('reads in-place patch changes when text triggers another projection', () => {
    const text = MutableState.of('# Stable\n\nbody\n');

    const range: [number, number] = [10, 11];

    const patches = MutableState.of<IRawPatchItem[]>([{ key: 'patch', range }]);

    const closure = render(S([TextChunker, { text, patches }]));

    const initial = closure.value.value;

    range[0] = 11;

    range[1] = 12;

    text.next('# Stable\n\nbody extended\n');

    const updated = closure.value.value;

    expect(updated[0]).toBe(initial[0]);

    expect(updated[1]?.patches).toEqual([{ key: 'patch', range: [1, 2] }]);

    expect(initial[1]?.patches).toEqual([{ key: 'patch', range: [0, 1] }]);

    closure.destroy();

    text.destroy();

    patches.destroy();
  });

  test('exposes reactive sections and follows text and patch changes', () => {
    const text = MutableState.of('# Initial\nparagraph\n');
    const patches = MutableState.of<IRawPatchItem[]>([{ key: 'paragraph', range: 10 }]);
    const closure = render(S([TextChunker, { text, patches }]));
    const next = jest.fn();

    expectTypeOf(closure.value).toEqualTypeOf<IReactiveState<IBlockSection[]>>();

    closure.value.subscribe(next);

    expect(next.mock.calls).toEqual([
      [
        [
          { text: '# Initial\n', patches: [] },
          { text: 'paragraph\n', patches: [{ key: 'paragraph', range: [0, 0] }] },
        ],
      ],
    ]);

    next.mockClear();
    text.next('# Updated\nparagraph\n');

    expect(closure.value.value).toEqual([
      { text: '# Updated\n', patches: [] },
      { text: 'paragraph\n', patches: [{ key: 'paragraph', range: [0, 0] }] },
    ]);
    expect(next).toHaveBeenCalledTimes(1);

    next.mockClear();
    patches.next([{ key: 'paragraph', range: [11, 14] }]);

    expect(closure.value.value).toEqual([
      { text: '# Updated\n', patches: [] },
      { text: 'paragraph\n', patches: [{ key: 'paragraph', range: [1, 4] }] },
    ]);
    expect(next).toHaveBeenCalledTimes(1);

    next.mockClear();
    text.next('');

    expect(closure.value.value).toEqual([]);
    expect(next.mock.calls).toEqual([[[]]]);
  });

  test('sets up lazily with the latest text and only subscribes once', () => {
    const text = MutableState.of('# Initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const textSubscribe = jest.spyOn(text, 'subscribe');
    const patchSubscribe = jest.spyOn(patches, 'subscribe');
    const closure = render(S([TextChunker, { text, patches }]));

    expect(textSubscribe).not.toHaveBeenCalled();
    expect(patchSubscribe).not.toHaveBeenCalled();

    text.next('# Latest\n');

    expect(closure.value.value).toEqual([{ text: '# Latest\n', patches: [] }]);
    expect(closure.value.value).toEqual([{ text: '# Latest\n', patches: [] }]);
    expect(textSubscribe).toHaveBeenCalledTimes(1);
    expect(patchSubscribe).toHaveBeenCalledTimes(1);
  });

  test('publishes only the final chunks from a batch', () => {
    const text = MutableState.of('initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const closure = render(S([TextChunker, { text, patches }]));
    const next = jest.fn();

    closure.value.subscribe(next);
    next.mockClear();

    batch(() => {
      text.next('# Intermediate\n');
      text.next('# Final\nparagraph\n');
      patches.next([{ key: 'paragraph', range: 8 }]);

      expect(next).not.toHaveBeenCalled();
    });

    expect(next.mock.calls).toEqual([
      [
        [
          { text: '# Final\n', patches: [] },
          { text: 'paragraph\n', patches: [{ key: 'paragraph', range: [0, 0] }] },
        ],
      ],
    ]);
  });

  test('closes its output and subscriptions without destroying inputs', () => {
    const text = MutableState.of('initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const closure = render(S([TextChunker, { text, patches }]));
    const outputSubscription = closure.value.subscribe(() => undefined);

    expect(getObserverCount(text)).toBeGreaterThan(0);
    expect(getObserverCount(patches)).toBeGreaterThan(0);

    closure.destroy();

    expect(outputSubscription.closed).toBe(true);
    expect(text.closed).toBe(false);
    expect(patches.closed).toBe(false);
    expect(getObserverCount(text)).toBe(0);
    expect(getObserverCount(patches)).toBe(0);
    expect(() => closure.destroy()).not.toThrow();
  });

  test('does not subscribe when destroyed before setup', () => {
    const text = MutableState.of('initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const textSubscribe = jest.spyOn(text, 'subscribe');
    const patchSubscribe = jest.spyOn(patches, 'subscribe');
    const closure = render(S([TextChunker, { text, patches }]));

    closure.destroy();

    expect(textSubscribe).not.toHaveBeenCalled();
    expect(patchSubscribe).not.toHaveBeenCalled();
    expect(() => closure.value).toThrow('Cannot set up a destroyed state closure.');
  });

  test('completes after both inputs complete', () => {
    const text = MutableState.of('initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const closure = render(S([TextChunker, { text, patches }]));
    const subscription = closure.value.subscribe(() => undefined);

    text.complete();

    expect(closure.value.closed).toBe(false);

    patches.complete();

    expect(closure.value.closed).toBe(true);
    expect(subscription.closed).toBe(true);
    expect(() => closure.destroy()).not.toThrow();
  });

  test('reads the last value when text completed before setup', () => {
    const text = MutableState.of('complete\n');
    const patches = MutableState.of<IRawPatchItem[]>([{ key: 'end', range: 9 }]);

    text.complete();
    patches.complete();

    const closure = render(S([TextChunker, { text, patches }]));

    expect(closure.value.value).toEqual([
      { text: 'complete\n', patches: [{ key: 'end', range: [9, 9] }] },
    ]);
    expect(closure.value.closed).toBe(true);
  });

  test('forwards errors from text', () => {
    const text = MutableState.of('initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const closure = render(S([TextChunker, { text, patches }]));
    const error = jest.fn();
    const subscription = closure.value.subscribe({ error });
    const reason = new Error('failed');

    text.error(reason);

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(reason);
    expect(subscription.closed).toBe(true);
    expect(patches.closed).toBe(false);
    expect(getObserverCount(patches)).toBe(0);
    expect(() => closure.destroy()).not.toThrow();
    expect(getObserverCount(patches)).toBe(0);
  });

  test('forwards errors from patches', () => {
    const text = MutableState.of('initial\n');
    const patches = MutableState.of<IRawPatchItem[]>([]);
    const closure = render(S([TextChunker, { text, patches }]));
    const error = jest.fn();
    const subscription = closure.value.subscribe({ error });
    const reason = new Error('failed');

    patches.error(reason);

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(reason);
    expect(subscription.closed).toBe(true);
    expect(text.closed).toBe(false);
    expect(getObserverCount(text)).toBe(1);
    expect(() => closure.destroy()).not.toThrow();
    expect(getObserverCount(text)).toBe(0);
  });
});
