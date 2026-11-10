import type { Paragraph, PhrasingContent, Root } from 'mdast';

import { PluginPriority } from '@fluxdown/types';
import { first } from 'lodash-es';

import { IncompleteInlineCodeRepairPlugin } from '../incomplete-inline-code';
import { TrailingEscapeRepairPlugin } from '../trailing-escape';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

const repairParagraph = (children: PhrasingContent[]): Paragraph => {
  const sourced = children.map((child) =>
    child.type === 'text' || child.type === 'html'
      ? { ...child, data: { source: child.value } }
      : child,
  );

  const result = runRepairs(root([paragraph(sourced)]), new IncompleteInlineCodeRepairPlugin());

  const repaired = first(result.children);

  expect(repaired?.type).toBe('paragraph');

  return repaired as Paragraph;
};

const nonTextualTails: PhrasingContent[] = [
  { type: 'image', url: '/tail.png', alt: 'tail' },
  { type: 'break' },
];

describe('IncompleteInlineCodeRepairPlugin', () => {
  test('exposes a matching stable key and ending-only config', () => {
    const plugin = new IncompleteInlineCodeRepairPlugin();

    expect(IncompleteInlineCodeRepairPlugin.key).toBe('repair-incomplete-inline-code');

    expect(plugin.config).toMatchObject({
      ending: true,
      priority: PluginPriority.High,
    });
  });

  test('repairs a tail delimiter with text on both sides', () => {
    const result = repairParagraph([
      { type: 'inlineCode', value: 'stable' },
      { type: 'text', value: 'before' },
      { type: 'text', value: 'prefix`suffix' },
      { type: 'html', value: '<span />' },
      { type: 'text', value: 'tail' },
    ]);

    expect(result.children).toMatchObject([
      { type: 'inlineCode', value: 'stable' },
      { type: 'text', value: 'before' },
      { type: 'text', value: 'prefix' },
      { type: 'inlineCode', value: 'suffix<span />tail' },
    ]);
  });

  test('repairs a tail delimiter without a prefix', () => {
    const result = repairParagraph([
      { type: 'text', value: '`suffix' },
      { type: 'html', value: '<span />' },
      { type: 'text', value: 'tail' },
    ]);

    expect(result.children).toMatchObject([{ type: 'inlineCode', value: 'suffix<span />tail' }]);
  });

  test('repairs a delimiter whose content comes entirely from following textual nodes', () => {
    const result = repairParagraph([
      { type: 'text', value: '`' },
      { type: 'html', value: '<span />' },
      { type: 'text', value: 'tail' },
    ]);

    expect(result.children).toMatchObject([{ type: 'inlineCode', value: '<span />tail' }]);
  });

  test('removes an empty delimiter at the actual container tail', () => {
    const result = repairParagraph([{ type: 'text', value: 'prefix`' }]);

    expect(result.children).toMatchObject([{ type: 'text', value: 'prefix' }]);
  });

  test('does not repair when another inline-code node follows the candidate', () => {
    const tree = root([
      paragraph([
        { type: 'text', value: 'prefix`suffix' },
        { type: 'inlineCode', value: 'later' },
        { type: 'text', value: 'tail' },
      ]),
    ]);

    expect(runRepairs(tree, new IncompleteInlineCodeRepairPlugin())).toEqual(tree);
  });

  test('does not repair a candidate outside the structural tail branch', () => {
    const tree: Root = root([
      paragraph([{ type: 'text', value: 'prefix`suffix' }]),
      paragraph([{ type: 'text', value: 'actual tail' }]),
    ]);

    expect(runRepairs(tree, new IncompleteInlineCodeRepairPlugin())).toEqual(tree);
  });

  test.each(nonTextualTails)(
    'does not drop a non-textual tail node while attempting repair',
    (tail) => {
      const tree = root([paragraph([{ type: 'text', value: 'prefix`suffix' }, tail])]);

      expect(runRepairs(tree, new IncompleteInlineCodeRepairPlugin())).toEqual(tree);
    },
  );

  test('keeps an escaped single backtick as text', () => {
    const tree = root([paragraph([{ type: 'text', value: 'prefix\\`suffix' }])]);

    expect(runRepairs(tree, new IncompleteInlineCodeRepairPlugin())).toEqual(tree);
  });

  test.each([
    ['before ``code', 'code'],
    ['before ``code ` literal', 'code ` literal'],
    ['before `code &amp;', 'code &amp;'],
    ['before `code \\* literal', 'code \\* literal'],
    ['before `code `` literal', 'code `` literal'],
    ['before `` code ', 'code'],
    ['before ``code\nnext', 'code next'],
  ])('repairs backtick runs using code-span whitespace rules: %s', (source, value) => {
    expect(
      repairMarkdown(source, new IncompleteInlineCodeRepairPlugin()).children[0],
    ).toMatchObject({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'before ' },
        { type: 'inlineCode', value },
      ],
    });
  });

  test.each(['before ``code`literal``', 'before `done`', 'before `` ` ``'])(
    'preserves an already parsed code span: %s',
    (source) => {
      expect(repairMarkdown(source, new IncompleteInlineCodeRepairPlugin())).toEqual(
        repairMarkdown(source, []),
      );
    },
  );

  test.each(['`', '``', '```'])(
    'keeps escaped punctuation and parsed formatting literal through every %s prefix',
    (marker) => {
      const prefix = 'Before ';

      const body = String.raw`code &amp; \path *x* [label](url)`;

      const source = prefix + marker + body + marker;

      for (let offset = prefix.length + marker.length; offset <= source.length; offset += 1) {
        const tree = repairMarkdown(source.slice(0, offset), [
          new TrailingEscapeRepairPlugin(),
          new IncompleteInlineCodeRepairPlugin(),
        ]);

        const container = tree.children[0] as Paragraph;

        const code = container.children.find((child) => child.type === 'inlineCode');

        const expected = body.slice(0, Math.max(0, offset - prefix.length - marker.length));

        expect({
          source: source.slice(0, offset),
          value: code?.type === 'inlineCode' ? code.value : '',
        }).toEqual({ source: source.slice(0, offset), value: expected });
      }
    },
  );

  test('temporarily holds a shorter closing run and restores it when more code follows', () => {
    const plugin = new IncompleteInlineCodeRepairPlugin();

    const pending = repairMarkdown('before ``one ` two`', plugin);

    const continued = repairMarkdown('before ``one ` two` literal', plugin);

    expect(pending.children[0]).toMatchObject({
      children: [
        { type: 'text', value: 'before ' },
        { type: 'inlineCode', value: 'one ` two' },
      ],
    });

    expect(continued.children[0]).toMatchObject({
      children: [
        { type: 'text', value: 'before ' },
        { type: 'inlineCode', value: 'one ` two` literal' },
      ],
    });
  });

  test.each([
    ['&amp; `code &amp;', '& ', 'code &amp;'],
    ['\\* `code \\*', '* ', String.raw`code \*`],
  ])('preserves raw code after a decoded prefix: %s', (source, prefix, value) => {
    expect(
      repairMarkdown(source, new IncompleteInlineCodeRepairPlugin()).children[0],
    ).toMatchObject({
      type: 'paragraph',
      children: [
        { type: 'text', value: prefix },
        { type: 'inlineCode', value },
      ],
    });
  });
});
