import type { Nodes as HastNode } from 'hast';
import type { Root } from 'mdast';
import type { InlineMath, Math } from 'mdast-util-math';

import { PluginPriority } from '@fluxdown/types';
import { sortBy } from 'lodash-es';

import { MarkdownCompiler } from '../../../../../core/src/states/hast/block-compiler/exports';
import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { ApplyRepairsRemarkPlugin } from '../apply-repairs';
import { EmojiRemarkPlugin } from '../emoji';
import { SyntaxMathRemarkPlugin, transformMath } from '../syntax-math';
import { SyntaxSoftEndlineRemarkPlugin } from '../syntax-soft-endline';
import { SyntaxTableRemarkPlugin } from '../syntax-table';
import { collectTextValues, parseMarkdown, walkMdast } from './utils';

const createPlugins = (repairEnding = true) =>
  sortBy(
    [
      new SyntaxSoftEndlineRemarkPlugin(),
      new SyntaxTableRemarkPlugin(),
      new ApplyRepairsRemarkPlugin({
        plugins: PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin()),
        ending: repairEnding,
      }),
      new EmojiRemarkPlugin(),
      new SyntaxMathRemarkPlugin(),
    ],
    (plugin) => plugin.config.priority ?? PluginPriority.Default,
  );

const mathNodes = (tree: Root) => {
  const nodes: Array<Math | InlineMath> = [];

  walkMdast(tree, (node) => {
    if (node.type === 'math' || node.type === 'inlineMath') {
      nodes.push(node);
    }
  });

  return nodes;
};

describe('math in the streaming remark pipeline', () => {
  test.each([String.raw`$x\notin A$`, String.raw`$x\in A$`, String.raw`$x\subseteq A$`])(
    'keeps an embedded control word in math as its spaced operand arrives: %s',
    (source) => {
      for (let length = 1; length <= source.length; length += 1) {
        const prefix = source.slice(0, length);

        const nodes = mathNodes(parseMarkdown(prefix, createPlugins()));

        expect(nodes.map((node) => node.value)).toEqual([
          source.slice(1, Math.min(length, source.length - 1)),
        ]);
      }
    },
  );

  test.each(['$plain words', String.raw`$x\\notin A`, '`$x\\notin A`'])(
    'does not infer a math control word from prose, escaped backslashes or code: %s',
    (source) => {
      expect(mathNodes(parseMarkdown(source, createPlugins()))).toEqual([]);
    },
  );

  test.each(['$x+1$2。', '$ x+1$。', '$x+1 $。', String.raw`$x\notin A $。`])(
    'does not reuse a rejected mathematical closer as a new ending opener: %s',
    (source) => {
      const rejectedAt = source.indexOf('$', 1) + (source.includes('$2') ? 2 : 1);

      for (let length = rejectedAt; length <= source.length; length += 1) {
        const prefix = source.slice(0, length);

        const tree = parseMarkdown(prefix, createPlugins());

        expect(mathNodes(tree)).toEqual([]);

        expect(collectTextValues(tree).join('')).toBe(prefix);
      }

      expect(
        mathNodes(parseMarkdown(source + ' $y+2$', createPlugins())).map((node) => node.value),
      ).toEqual(['y+2']);
    },
  );

  test.each(['Price $5 and $x+1$', '$plain words $x+1$'])(
    'retains a real formula opener after an ambiguous currency or prose dollar: %s',
    (source) => {
      for (const ending of [true, false]) {
        expect(
          mathNodes(parseMarkdown(source, createPlugins(ending))).map((node) => node.value),
        ).toEqual(['x+1']);
      }
    },
  );

  test.each(['$$F=ma$$', '$$W=Fd\\cos\\theta$$'])(
    'withholds only the first character of a possible double-dollar closer: %s',
    (source) => {
      for (let length = 2; length <= source.length; length += 1) {
        const prefix = source.slice(0, length);

        const nodes = mathNodes(parseMarkdown('before ' + prefix, createPlugins()));

        const valueEnd = Math.min(length, source.length - 2);

        expect(nodes.map((node) => node.value)).toEqual([source.slice(2, valueEnd)]);

        expect(nodes[0]?.data?.repairEnding).toBe(length < source.length ? true : undefined);
      }
    },
  );

  test.each(['$$\nF=ma\n$', '$$\n\\alpha\n$', '> $$\n> F=ma\n> $'])(
    'withholds an unfinished block closer while retaining the preceding TeX boundary: %s',
    (source) => {
      const nodes = mathNodes(parseMarkdown(source, createPlugins()));

      expect(nodes).toHaveLength(1);

      expect(nodes[0]?.value).toBe(source.includes('alpha') ? '\\alpha\n' : 'F=ma\n');

      expect(nodes[0]?.data?.repairEnding).toBe(true);

      expect(mathNodes(parseMarkdown(source + '$', createPlugins()))[0]?.value).toBe(
        source.includes('alpha') ? '\\alpha' : 'F=ma',
      );
    },
  );

  test.each([
    [String.raw`before $$x\$`, String.raw`x\$`],
    ['before $$x$y', 'x$y'],
    ['before $$x$ ', 'x$ '],
    ['before $$ $ $$', '$'],
    ['$$\nx$', 'x$'],
    ['$$\nx\n$ ', 'x\n$ '],
    ['$$\nx\n$\n', 'x\n$\n'],
    ['$$\nx\n$\ny', 'x\n$\ny'],
    ['$$\nx\n\\$', 'x\n\\$'],
    ['$$\nx\n$\n$$', 'x\n$'],
  ])('keeps escaped or disambiguated literal dollars unchanged: %s', (source, value) => {
    expect(mathNodes(parseMarkdown(source, createPlugins())).map((node) => node.value)).toEqual([
      value,
    ]);
  });

  test('retains an incomplete double-dollar expression literally after repair is disabled', () => {
    const tree = parseMarkdown('before $$F=ma$', createPlugins(false));

    expect(mathNodes(tree)).toEqual([]);

    expect(collectTextValues(tree).join('')).toBe('before $$F=ma$');

    expect(mathNodes(parseMarkdown('$$\nF=ma\n$', createPlugins(false)))[0]?.value).toBe('F=ma\n$');
  });

  test.each(['$u+1$$v-1$', '$x$$y$$z$', '$甲$$乙$'])(
    'keeps adjacent single-dollar formulas separate at every input prefix: %s',
    (source) => {
      for (let length = 1; length <= source.length; length += 1) {
        const prefix = source.slice(0, length);

        const nodes = mathNodes(parseMarkdown(prefix, createPlugins()));

        const values = prefix.split('$').filter((_value, index) => index % 2 === 1);

        expect(nodes.map((node) => node.value)).toEqual(values);

        for (const node of nodes) {
          expect(node.data?.pandocMath?.mode).toBeUndefined();

          expect(node.value).not.toContain('$');
        }
      }
    },
  );

  test.each(['$x$$', '$x$$y'])(
    'limits pending adjacent-dollar interpretation to ending repair: %s',
    (source) => {
      const completed = parseMarkdown(source, createPlugins(false));

      expect(mathNodes(completed)).toEqual([]);

      expect(collectTextValues(completed).join('')).toBe(source);
    },
  );

  test('preserves the existing closed double-dollar interpretation when ending repair is disabled', () => {
    const tree = parseMarkdown('$x$$y$$z', createPlugins(false));

    expect(mathNodes(tree).map((node) => node.value)).toEqual(['y']);

    expect(collectTextValues(tree).join('')).toBe('$xz');
  });

  test('retains exact closed-formula sources while consuming an adjacent incomplete tail', () => {
    const tree = parseMarkdown('$x$$y$$z', createPlugins());

    const nodes = mathNodes(tree);

    expect(nodes.map((node) => node.data?.source)).toEqual(['$x$', '$y$', undefined]);

    expect(nodes.map((node) => node.data?.repairEnding)).toEqual([undefined, undefined, true]);

    expect(tree.data?.source).toBeUndefined();

    expect(tree.children[0]?.data?.source).toBeUndefined();
  });

  test.each([
    [String.raw`\$x\$\$y\$`, []],
    ['`$x$$y`', []],
    ['$$x$$', ['x']],
    ['$$ $ $$', ['$']],
    ['$x$$ this is prose', []],
    ['$x$$\ncontinued', []],
  ] as const)(
    'preserves escaped dollars, code, double-dollar math and prose: %s',
    (source, values) => {
      expect(mathNodes(parseMarkdown(source, createPlugins())).map((node) => node.value)).toEqual(
        values,
      );
    },
  );

  test.each([
    '\\[\nx+y\n\\]',
    String.raw`\[
\begin{aligned}
x_1 &= y_2 \\
x_2 &= y_3
\end{aligned}
\]`,
  ])('recognizes multiline display math before soft line endings: %s', (source) => {
    const tree = parseMarkdown(`before\nline\n\n${source}\n\nafter\nline`, createPlugins());

    expect(mathNodes(tree)).toMatchObject([
      { value: source.slice(2, -2), data: { pandocMath: { mode: 'display' } } },
    ]);

    expect(mathNodes(tree)[0]?.data?.repairEnding).toBeUndefined();

    const breaks: string[] = [];

    walkMdast(tree, (node) => {
      if (node.type === 'break') {
        breaks.push(node.type);
      }
    });

    expect(breaks).toHaveLength(2);
  });

  test('keeps the display mode from the first recognized escaped-markers prefix', () => {
    const source = String.raw`\[方括号\]`;

    for (let length = 2; length <= source.length; length += 1) {
      const tree = parseMarkdown(source.slice(0, length), createPlugins());

      expect(mathNodes(tree)).toHaveLength(1);

      expect(mathNodes(tree)[0]?.data?.pandocMath?.mode).toBe('display');

      expect(mathNodes(tree)[0]?.data?.repairEnding).toBe(
        length < source.length ? true : undefined,
      );
    }
  });

  test.each([String.raw`\\[text\\]`, String.raw`\\(text\\)`])(
    'keeps genuinely escaped delimiters as ordinary text: %s',
    (source) => {
      for (let length = 2; length <= source.length; length += 1) {
        expect(mathNodes(parseMarkdown(source.slice(0, length), createPlugins()))).toEqual([]);
      }
    },
  );

  test.each([String.raw`\[a * b * c`, String.raw`\[a ** b ** c`, String.raw`$x_{a} + y_{b}`])(
    'retains raw TeX when Markdown initially creates emphasis fragments: %s',
    (source) => {
      const node = mathNodes(parseMarkdown(source, createPlugins()))[0];

      expect(node?.value).toBe(source.slice(source.startsWith('$') ? 1 : 2));

      expect(node?.data?.repairEnding).toBe(true);
    },
  );

  test('preserves surrounding Markdown and emoji while protecting TeX contents', () => {
    const source = String.raw`**before** :rocket: \[a *b* + :rocket:\] *after*`;

    const tree = parseMarkdown(source, createPlugins());

    expect(mathNodes(tree)).toMatchObject([{ value: 'a *b* + :rocket:' }]);

    expect(collectTextValues(tree).join('')).toBe('before 🚀  after');

    const paragraph = tree.children[0];

    expect(
      paragraph?.type === 'paragraph'
        ? paragraph.children.filter((node) => node.type !== 'text').map((node) => node.type)
        : [],
    ).toEqual(['strong', 'inlineMath', 'emphasis']);
  });

  test.each([
    '`\\[x\\]`',
    '```tex\n\\[x\\]\n```',
    String.raw`\[x + ` + '`code`',
    String.raw`\[x + *bold ` + '`code`*',
    String.raw`\[x + [link](https://example.com)`,
    String.raw`\[x + *[link](https://example.com)*`,
  ])('does not consume code or a completed Markdown resource as TeX: %s', (source) => {
    expect(mathNodes(parseMarkdown(source, createPlugins()))).toEqual([]);
  });

  test.each([
    ['$x', true],
    ['$x$', false],
    [String.raw`\[x`, true],
    [String.raw`\[x\]`, false],
    ['$$\nx', true],
    ['$$\nx\n$$', false],
  ] as const)('marks only an unclosed trailing formula: %s', (source, incomplete) => {
    const tree = parseMarkdown(source, createPlugins());

    const node = mathNodes(tree)[0];

    expect(node?.data?.repairEnding).toBe(incomplete ? true : undefined);

    const hast = MarkdownCompiler.build({ text: source, remarks: createPlugins() });

    const pending: HastNode[] = [hast];

    const flags: boolean[] = [];

    while (pending.length > 0) {
      const current = pending.pop();

      if (current?.data?.repairEnding === true) {
        flags.push(true);
      }

      if (current && 'children' in current) {
        pending.push(...current.children);
      }
    }

    expect(flags).toHaveLength(incomplete ? 1 : 0);
  });

  test('does not mark block math as incomplete after ending repair is disabled', () => {
    expect(
      mathNodes(parseMarkdown('$$\nx', createPlugins(false)))[0]?.data?.repairEnding,
    ).toBeUndefined();
  });

  test.each(['> \\[\n> x+y\n> \\]', '> > \\[\n> > x+y\n> > \\]', '> $$\n> x+y\n> $$'])(
    'excludes quote markers from the formula and recognizes its closer: %s',
    (source) => {
      const nodes = mathNodes(parseMarkdown(source, createPlugins()));

      expect(nodes).toHaveLength(1);

      expect(nodes[0]?.value.trim()).toBe('x+y');

      expect(nodes[0]?.data?.repairEnding).toBeUndefined();
    },
  );

  test('keeps an earlier unclosed candidate outside the final Markdown paragraph', () => {
    const tree = parseMarkdown(String.raw`\[x` + '\n\nplain paragraph', createPlugins());

    expect(mathNodes(tree)).toEqual([]);

    expect(collectTextValues(tree).join('')).toContain('plain paragraph');
  });

  test.each(['| $x', '| $x$ | value', String.raw`| \[x\] | value`])(
    'allows the table repair to hide a pending header before math ending repair: %s',
    (source) => {
      expect(collectTextValues(parseMarkdown(source, createPlugins())).join('')).toBe('');
    },
  );

  test('retains closed math provenance for the final table-cell code repair', () => {
    const tree = parseMarkdown('| A | B |\n| --- | --- |\n| $x$ | `code', createPlugins());

    const codes: string[] = [];

    walkMdast(tree, (node) => {
      if (node.type === 'inlineCode') {
        codes.push(node.value);
      }
    });

    expect(codes).toEqual(['code']);

    expect(mathNodes(tree)).toMatchObject([{ value: 'x' }]);
  });

  test('keeps the exact raw source of a closed formula across quote continuation markers', () => {
    const raw = String.raw`\[` + '\n> x+y\n> ' + String.raw`\]`;

    const tree = parseMarkdown('> before ' + raw + ' after', [new SyntaxMathRemarkPlugin()]);

    expect(mathNodes(tree)[0]?.data?.source).toBe(raw);

    expect(tree.data?.source).toBe('> before ' + raw + ' after');
  });

  test('uses source metadata without positions and consumes changed ancestors', () => {
    const tree: Root = {
      type: 'root',
      data: { source: String.raw`\[x` },
      children: [
        {
          type: 'paragraph',
          data: { source: String.raw`\[x` },
          children: [{ type: 'text', value: '[x', data: { source: String.raw`\[x` } }],
        },
      ],
    };

    transformMath(tree, true);

    expect(mathNodes(tree)).toMatchObject([{ value: 'x', data: { repairEnding: true } }]);

    expect(tree.data?.source).toBeUndefined();

    expect(tree.children[0]?.data?.source).toBeUndefined();

    expect(mathNodes(tree)[0]?.data?.source).toBeUndefined();
  });

  test.each([undefined, String.raw`\[original`])(
    'does not infer formulas from missing or stale source metadata: %s',
    (source) => {
      const tree: Root = {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: '[changed', data: { source } }] },
        ],
      };

      transformMath(tree, true);

      expect(mathNodes(tree)).toEqual([]);

      expect(collectTextValues(tree)).toEqual(['[changed']);
    },
  );
});
