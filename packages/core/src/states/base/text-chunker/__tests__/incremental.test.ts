import { Marked } from 'marked';
import { MutableState, render, S } from 'stative';

import { TextChunker, type TextChunkerConfig } from '../index';
import { LexerChunker } from '../utils/chunker';

const CONFIG: TextChunkerConfig = { indentedCode: true, setextHeading: true, tex: true };

const DOCUMENTS = [
  '# Heading\n\nParagraph **with emphasis**.\n\n- first\n- second\n\nNext paragraph.\n',
  'Title\n---\nafter\n\n| a | b |\n| - | - |\n| 1 | 2 |\n# Next\n',
  '- item\n\n  nested paragraph\n\n      code\n\n- next\n\nend\n',
  '    code\n\n    continued\n\n2. item\n\nparagraph\n',
  '> quote\n>\n> ```md\n> # code\n> ```\n\nend\n',
  '```md\n# code\n\n[^not]: definition\n```\n~~~txt\nnext\n~~~\nafter\n',
  '<div>\n\nparagraph\n\n<custom>\n\ninner\n\n</custom>\n</div>\n\nafter\n',
  '<div>\n\nparagraph\n\n</div>\n\nafter\n\\[\nx\n\\]\ncontinued\n\nlast\n',
  '<script>\n\nconst text = "[^not]";\n</script>\n\n<!-- comment -->\n\nafter\n',
  '$$\na+b\n\n---\n$$\nafter\n\n\\[\nx\n\\]\ncontinued\n\nend\n',
  '# Title\n\nRead [the reference][ref].\n\n[ref]: https://example.test\n',
  'Paragraph\n\nFootnote[^note].\n\n[^note]: definition\n',
  'Paragraph [x](https://example.test\n"title\n\npart")\n\nnext\n',
  '| a | b |\n| - | - |\n| 1 | 2 |\n$$\n[ref]: hidden\n$$\n2. item\n\nafter\n',
  '# 标题\r\n\r\n🙂👩‍💻\r\n\r\n| a | b |\r\n| - | - |\r\n| 1 | 2 |\r\n\r\nend\r',
];

describe('incremental Markdown chunking', () => {
  test.each(DOCUMENTS)('matches complete scans at every append: %j', (document) => {
    const chunker = new LexerChunker();

    for (let length = 0; length <= document.length; length += 1) {
      const text = document.slice(0, length);

      expect(chunker.chunk(text, CONFIG)).toEqual(new LexerChunker().chunk(text, CONFIG));
    }
  });

  test.each([false, true])('follows all syntax policies with tex=%s', (tex) => {
    for (const indentedCode of [false, true]) {
      for (const setextHeading of [false, true]) {
        const config = { indentedCode, setextHeading, tex };

        const chunker = new LexerChunker();

        const document = DOCUMENTS.join('\n');

        for (let length = 1; length <= document.length; length += 7) {
          const text = document.slice(0, length);

          expect(chunker.chunk(text, config)).toEqual(new LexerChunker().chunk(text, config));
        }
      }
    }
  });

  test('lexes only the mutable tail after a sealed prefix', () => {
    const chunker = new LexerChunker();

    const prefix = '# Heading\n\nParagraph.\n\n```txt\ncode\n```\n';

    chunker.chunk(prefix + 'tail', CONFIG);

    const lexer = jest.spyOn(Marked.prototype, 'lexer');

    try {
      expect(chunker.chunk(prefix + 'tail extended', { ...CONFIG })).toEqual([
        '# Heading\n\n',
        'Paragraph.\n\n',
        '```txt\ncode\n```\n',
        'tail extended',
      ]);

      expect(lexer.mock.calls.map(([source]) => source)).toEqual(['tail extended']);
    } finally {
      lexer.mockRestore();
    }
  });

  test('keeps unfinished starters with the blocks they can still extend', () => {
    const chunker = new LexerChunker();

    const prefix = '# Stable\n\n';

    for (const text of ['paragraph\n#', 'paragraph\n#not a heading', 'paragraph\n---']) {
      expect(chunker.chunk(prefix + text, CONFIG)).toEqual(
        new LexerChunker().chunk(prefix + text, CONFIG),
      );
    }
  });

  test('revisits adjacent paragraphs when a later TeX extension joins their tokens', () => {
    const chunker = new LexerChunker();

    const config = { ...CONFIG, setextHeading: false };

    const prefix = '# Stable\n\n`\n#Title\n---\n\n';

    chunker.chunk(prefix + 'tail', config);

    expect(chunker.chunk(prefix + 'tail\n\n$$\na+b\n$$\n', config)).toEqual([
      '# Stable\n\n',
      '`\n#Title\n',
      '---\n\n',
      'tail\n\n',
      '$$\na+b\n$$\n',
    ]);
  });

  test('retains an unfinished reference label before later complete blocks', () => {
    const chunker = new LexerChunker();

    const prefix = '# Stable\n\n[label\n\n# Heading\n\nparagraph\n\n';

    chunker.chunk(prefix + 'tail', CONFIG);

    const text = prefix + 'tail]: https://example.test\n';

    expect(chunker.chunk(text, CONFIG)).toEqual([text]);
  });

  test('keeps paragraph boundaries provisional while an extension opener is unfinished', () => {
    const chunker = new LexerChunker();

    const config = { ...CONFIG, setextHeading: false };

    const prefix = '# Stable\n\nx\n#Title\n---\n\n';

    for (const tail of ['tail', 'tail\n\\[', 'tail\n\\[text']) {
      expect(chunker.chunk(prefix + tail, config)).toEqual(
        new LexerChunker().chunk(prefix + tail, config),
      );
    }
  });

  test('restores document scope when a tail introduces a definition or footnote', () => {
    for (const tail of ['[ref]: https://example.test\n', 'footnote[^note]\n']) {
      const chunker = new LexerChunker();

      const prefix = '# Heading\n\nRead [label][ref].\n\n';

      chunker.chunk(prefix + tail.slice(0, 3), CONFIG);

      expect(chunker.chunk(prefix + tail, CONFIG)).toEqual([prefix + tail]);
    }
  });

  test('resets checkpoints after replacements, removals, and policy changes', () => {
    const chunker = new LexerChunker();

    const updates = [
      ['# Heading\n\nparagraph\n\ntail', CONFIG],
      ['# Changed\n\nparagraph\n\ntail', CONFIG],
      ['# Changed\n\nparagraph\n\ntail extended', CONFIG],
      ['# Changed\n', CONFIG],
      ['', CONFIG],
      ['Title\n---\n\n    code\n\ntail', CONFIG],
      ['Title\n---\n\n    code\n\ntail', { ...CONFIG, setextHeading: false }],
      ['Title\n---\n\n    code\n\ntail extended', { ...CONFIG, indentedCode: false }],
    ] as const;

    for (const [text, config] of updates) {
      expect(chunker.chunk(text, config)).toEqual(new LexerChunker().chunk(text, config));
    }
  });

  test('projects patches against reused prefix sections and the rescanned tail', () => {
    const text = MutableState.of('first\n\ntail');

    const patches = MutableState.of([{ key: 'tail', range: 7 }]);

    const closure = render(S([TextChunker, { text, patches }]));

    const initial = closure.value.value;

    text.next('first\n\ntail extended\n\nlast');

    expect(closure.value.value).toEqual([
      { text: 'first\n\n', patches: [] },
      { text: 'tail extended\n\n', patches: [{ key: 'tail', range: [0, 0] }] },
      { text: 'last', patches: [] },
    ]);

    expect(closure.value.value[0]).toBe(initial[0]);

    closure.destroy();

    text.destroy();

    patches.destroy();
  });
});
