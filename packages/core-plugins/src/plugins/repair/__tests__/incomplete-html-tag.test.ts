import type { Literal, Paragraph } from 'mdast';

import { PluginPriority } from '@fluxdown/types';
import { first, last } from 'lodash-es';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { collectTextValues, parseMarkdown } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxAutolinkRemarkPlugin } from '../../remark/syntax-autolink';
import { IncompleteHtmlTagRepairPlugin } from '../incomplete-html-tag';
import { paragraph, root, runRepairs } from './utils';

const incompleteOpeningTags = [
  '<',
  '<img',
  '<img/',
  '<img /',
  '<img src',
  '<img src=',
  '<img src="',
  '<img src="abc',
  '<img src="abc"',
  '<img src="abc"/',
  '<img src="abc" /',
  '<img src="abc" alt',
  '<img src="abc" alt="',
  '<img src="abc" alt="test',
  '<img src="abc" alt="test"',
  '<img src="abc" alt="test"/',
  '<img src="abc" alt="test" /',
];

const completeTags = [
  '<img>',
  '<img/>',
  '<img />',
  '<img src="abc"/>',
  '<img src="abc" />',
  '</img>',
  '<x-card2 open>',
  '<x-card2 data-id=example>',
];

const repairLiteral = (type: 'text' | 'html', value: string): Literal | undefined => {
  const result = runRepairs(
    root([paragraph([{ type, value, data: { source: value } }])]),
    new IncompleteHtmlTagRepairPlugin(),
    { ending: false },
  );
  const container = first(result.children) as Paragraph;
  const node = last(container.children);

  return node && 'value' in node ? node : undefined;
};

describe('IncompleteHtmlTagRepairPlugin', () => {
  test('exposes a matching stable key and always-on config', () => {
    const plugin = new IncompleteHtmlTagRepairPlugin();

    expect(IncompleteHtmlTagRepairPlugin.key).toBe('repair-incomplete-html-tag');
    expect(plugin.config).toMatchObject({ priority: PluginPriority.Default });
    expect(plugin.config.ending).toBeFalsy();
  });

  test.each(incompleteOpeningTags)('removes an incomplete opening tag suffix: %s', (suffix) => {
    expect(repairLiteral('text', `prefix${suffix}`)).toMatchObject({
      type: 'text',
      value: 'prefix',
    });
  });

  test.each(['</', '</img'])('removes an incomplete closing tag suffix: %s', (suffix) => {
    expect(repairLiteral('text', `prefix${suffix}`)).toMatchObject({
      type: 'text',
      value: 'prefix',
    });
  });

  test.each(completeTags)('keeps a complete HTML tag unchanged: %s', (suffix) => {
    expect(repairLiteral('text', `prefix${suffix}`)).toMatchObject({
      type: 'text',
      value: `prefix${suffix}`,
    });
  });

  test('keeps ordinary text unchanged', () => {
    expect(repairLiteral('text', 'prefix')).toMatchObject({
      type: 'text',
      value: 'prefix',
    });
  });

  test('repairs a raw HTML literal as the structural tail', () => {
    expect(repairLiteral('html', '<span>prefix<img src="abc" /')).toMatchObject({
      type: 'html',
      value: '<span>prefix',
    });
  });

  test('does not skip a later non-target leaf to modify earlier text', () => {
    const tree = root([
      paragraph([
        { type: 'text', value: 'prefix<img' },
        { type: 'image', url: '/tail.png', alt: 'tail' },
      ]),
    ]);

    expect(runRepairs(tree, new IncompleteHtmlTagRepairPlugin(), { ending: false })).toEqual(tree);
  });

  test('supports incomplete custom-element names containing digits', () => {
    expect(repairLiteral('text', 'prefix<x-card2 data-id')).toMatchObject({
      type: 'text',
      value: 'prefix',
    });
  });

  test('handles a long malformed suffix without pathological slowdown', () => {
    const value = `prefix<x-card data-value="${'a'.repeat(50_000)}`;

    expect(repairLiteral('text', value)).toMatchObject({
      type: 'text',
      value: 'prefix',
    });
  }, 2_000);
});

const parseHtml = (source: string) =>
  parseMarkdown(source, [
    new SyntaxAutolinkRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({
      plugins: [new IncompleteHtmlTagRepairPlugin()],
      ending: false,
      safe: false,
    }),
  ]);

describe('HTML attributes split by autolinks', () => {
  test.each([
    '<a href="https://example.test/path" title="document">',
    '<span data-url="https://example.test" title="a < b">',
    "<a href='https://example.test'>",
    '<a href=/local/path>',
  ])('never exposes an attribute while the opening tag is incomplete: %s', (tag) => {
    for (let offset = 1; offset < tag.length; offset += 1) {
      const source = 'before ' + tag.slice(0, offset);

      expect({ source, text: collectTextValues(parseHtml(source)).join('') }).toEqual({
        source,
        text: 'before ',
      });
    }

    const complete = 'before ' + tag + 'content';

    expect(parseHtml(complete)).toEqual(
      parseMarkdown(complete, [
        new SyntaxAutolinkRemarkPlugin(),
        new ApplyRepairsRemarkPlugin({ plugins: [] }),
      ]),
    );
  });

  test.each(['<', '</', '</s', '</span'])(
    'preserves body text while a closing tag is incomplete: %s',
    (closing) => {
      expect(collectTextValues(parseHtml('<span>content' + closing)).join('')).toBe('content');
    },
  );

  test.each([
    String.raw`\<span title="literal`,
    '&lt;span title="literal',
    '`<a href="https://example.test">`',
    'x < 3',
    'x < y',
  ])('keeps literal syntax and code untouched: %s', (source) => {
    expect(parseHtml(source)).toEqual(
      parseMarkdown(source, [
        new SyntaxAutolinkRemarkPlugin(),
        new ApplyRepairsRemarkPlugin({ plugins: [] }),
      ]),
    );
  });
});

const parseAll = (source: string) =>
  parseMarkdown(source, [
    new SyntaxAutolinkRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({
      plugins: PRESET_REPAIR_PLUGINS.filter(
        (Plugin) => Plugin.key !== 'repair-incomplete-math',
      ).map((Plugin) => new Plugin()),
      ending: true,
      safe: false,
    }),
  ]);

describe('HTML repair after other inline repairs', () => {
  test.each([
    'before <a title="[manual',
    'before <a title="`code',
    'before <a href="https://example.test/[path',
  ])(
    'removes the whole pending attribute even after another repair consumes its tail: %s',
    (source) => {
      expect(collectTextValues(parseAll(source)).join('')).toBe('before ');
    },
  );

  test.each(['`literal <a', '`literal <a title="[text', '`literal <a href="https://example.test'])(
    'preserves pending HTML-looking text inside unfinished inline code: %s',
    (source) => {
      expect(parseAll(source).children[0]).toMatchObject({
        children: [{ type: 'inlineCode', value: source.slice(1) }],
      });
    },
  );
});

test.each([true, false])(
  'repairs a later HTML suffix after an unfinished angle URL, autolink=%s',
  (autolink) => {
    const tree = parseMarkdown('before <https:// and <span title="pending', [
      ...(autolink ? [new SyntaxAutolinkRemarkPlugin()] : []),
      new ApplyRepairsRemarkPlugin({
        plugins: [new IncompleteHtmlTagRepairPlugin()],
        ending: true,
      }),
    ]);

    expect(collectTextValues(tree).join('')).toBe('before <https:// and ');
  },
);
