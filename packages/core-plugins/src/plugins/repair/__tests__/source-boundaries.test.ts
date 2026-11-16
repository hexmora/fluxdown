import type { Parent, RootContent } from 'mdast';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { DanglingFootnoteRepairPlugin } from '../dangling-footnote';
import { IncompleteCodeFenceRepairPlugin } from '../incomplete-code-fence';
import { IncompleteEmphasisRepairPlugin } from '../incomplete-emphasis';
import { IncompleteHtmlTagRepairPlugin } from '../incomplete-html-tag';
import { IncompleteImageRepairPlugin } from '../incomplete-image';
import { IncompleteInlineCodeRepairPlugin } from '../incomplete-inline-code';
import { IncompleteLinkRepairPlugin } from '../incomplete-link';
import { IncompleteListMarkerRepairPlugin } from '../incomplete-list-marker';
import { IncompleteStrongRepairPlugin } from '../incomplete-strong';
import { TrailingEscapeRepairPlugin } from '../trailing-escape';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

const plugins = PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin());

const literals = [
  { Plugin: IncompleteEmphasisRepairPlugin, source: String.raw`\*literal` },
  { Plugin: IncompleteEmphasisRepairPlugin, source: String.raw`\_literal` },
  { Plugin: IncompleteEmphasisRepairPlugin, source: '&#42;literal' },
  { Plugin: IncompleteStrongRepairPlugin, source: String.raw`\**literal` },
  { Plugin: IncompleteStrongRepairPlugin, source: '&#95;&#95;literal' },
  { Plugin: IncompleteStrongRepairPlugin, source: '*\\*literal' },
  { Plugin: IncompleteImageRepairPlugin, source: '!\\[literal' },
  { Plugin: IncompleteStrongRepairPlugin, source: String.raw`\**literal*` },
  { Plugin: IncompleteInlineCodeRepairPlugin, source: '\\`literal' },
  { Plugin: IncompleteInlineCodeRepairPlugin, source: '&#96;literal' },
  { Plugin: IncompleteCodeFenceRepairPlugin, source: '\\`' },
  { Plugin: IncompleteCodeFenceRepairPlugin, source: '&#96;' },
  { Plugin: IncompleteCodeFenceRepairPlugin, source: '&#126;' },
  { Plugin: IncompleteLinkRepairPlugin, source: String.raw`\[literal` },
  { Plugin: IncompleteLinkRepairPlugin, source: '&#91;literal' },
  { Plugin: IncompleteImageRepairPlugin, source: String.raw`\![literal` },
  { Plugin: IncompleteImageRepairPlugin, source: '!&#91;literal' },
  { Plugin: IncompleteHtmlTagRepairPlugin, source: String.raw`\<span` },
  { Plugin: IncompleteHtmlTagRepairPlugin, source: '&lt;span' },
  { Plugin: DanglingFootnoteRepairPlugin, source: String.raw`\[^literal]` },
  { Plugin: DanglingFootnoteRepairPlugin, source: '&#91;^literal]' },
  { Plugin: IncompleteListMarkerRepairPlugin, source: String.raw`\-` },
  { Plugin: IncompleteListMarkerRepairPlugin, source: '&#45;' },
  { Plugin: IncompleteListMarkerRepairPlugin, source: '1&#46;' },
  { Plugin: DanglingFootnoteRepairPlugin, source: '[&#94;literal]' },
  { Plugin: IncompleteCodeFenceRepairPlugin, source: '`&#96;' },
  { Plugin: TrailingEscapeRepairPlugin, source: String.raw`prefix \\` },
  { Plugin: TrailingEscapeRepairPlugin, source: '&#92;' },
];

describe('repair source boundaries', () => {
  test.each(literals)('preserves an escaped or decoded literal: $source', ({ Plugin, source }) => {
    expect(repairMarkdown(source, new Plugin())).toEqual(repairMarkdown(source, []));
  });

  test.each([
    ['*word &amp;', 'emphasis', 'word &'],
    ['**word &amp;', 'strong', 'word &'],
    ['`word &amp;', 'inlineCode', 'word &amp;'],
    ['[word &amp;', 'link', 'word &'],
  ])('locates a source marker before decoded content: %s', (source, type, value) => {
    const tree = repairMarkdown(source, plugins);

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [
        type === 'inlineCode' ? { type, value } : { type, children: [{ type: 'text', value }] },
      ],
    });
  });

  test('preserves ambiguous multiline code when container prefixes prevent source reconstruction', () => {
    const source = '> `word &amp;\n> tail';

    expect(repairMarkdown(source, plugins)).toEqual(repairMarkdown(source, []));
  });

  test('repairs a marker after an escaped or decoded prefix', () => {
    for (const source of [String.raw`\*literal **bold`, '&#42;literal **bold']) {
      expect(repairMarkdown(source, plugins).children[0]).toMatchObject({
        type: 'paragraph',
        children: [
          { type: 'text', value: '*literal ' },
          { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
        ],
      });
    }
  });

  test('repairs a multiline blockquote tail using its original source offset', () => {
    const tree = repairMarkdown('> line\n> **bold', plugins);

    expect(tree.children[0]).toMatchObject({
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'line\n' },
            { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          ],
        },
      ],
    });
  });

  test('does not reuse source after a preceding repair shortens the text', () => {
    const shortened = repairMarkdown('**bold\\', new TrailingEscapeRepairPlugin());

    const tree = runRepairs(shortened, new IncompleteStrongRepairPlugin());

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', value: '**bold' }],
    });
  });

  test('repairs structure before trimming an unfinished literal escape', () => {
    const tree = repairMarkdown('**bold\\', plugins);

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'strong', children: [{ type: 'text', value: 'bold' }] }],
    });
  });

  test('does not reinterpret a literal after another repair shortens the tail', () => {
    const tree = repairMarkdown(String.raw`\**literal` + '\\', plugins);

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', value: '**literal' }],
    });
  });

  test('preserves escaped footnotes while removing unresolved syntax in the same text', () => {
    const source = String.raw`\[^literal] [^missing] [^partial`;

    const tree = repairMarkdown(source, new DanglingFootnoteRepairPlugin());

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', value: '[^literal]  ' }],
    });
  });

  test.each([
    { Plugin: IncompleteStrongRepairPlugin, value: '**bold' },
    { Plugin: IncompleteEmphasisRepairPlugin, value: '*italic' },
    { Plugin: IncompleteInlineCodeRepairPlugin, value: '`code' },
    { Plugin: IncompleteLinkRepairPlugin, value: '[label' },
    { Plugin: IncompleteImageRepairPlugin, value: '![alt' },
    { Plugin: IncompleteHtmlTagRepairPlugin, value: '<span' },
    { Plugin: IncompleteListMarkerRepairPlugin, value: 'prefix\n2.' },
    { Plugin: IncompleteCodeFenceRepairPlugin, value: 'prefix\n``' },
    { Plugin: DanglingFootnoteRepairPlugin, value: '[^missing]' },
    { Plugin: TrailingEscapeRepairPlugin, value: 'tail\\' },
  ])('skips source-dependent $Plugin.name without node source', ({ Plugin, value }) => {
    const tree = root([paragraph([{ type: 'text', value }])]);

    expect(runRepairs(tree, new Plugin())).toEqual(tree);
  });

  test.each([
    '**bold',
    '_italic',
    'before ``code &amp;',
    '[label',
    '![alt',
    '<span',
    '[^missing]',
    'prefix\n2.',
    '~~~\ncode\n~~',
  ])('uses node source without any positions: %s', (source) => {
    const tree = repairMarkdown(source, []);

    const expected = repairMarkdown(source, plugins);

    removePositions(tree);

    removePositions(expected);

    expect(runRepairs(tree, plugins)).toEqual(expected);
  });

  test('clears stale literal and ancestor source while retaining unaffected siblings', () => {
    const source = '`stable` **bold';

    const tree = repairMarkdown(source, []);

    const result = runRepairs(tree, new IncompleteStrongRepairPlugin());

    const container = result.children[0];

    expect(result.data?.source).toBeUndefined();

    expect(container?.data?.source).toBeUndefined();

    if (container?.type !== 'paragraph') {
      throw new Error('Expected a paragraph');
    }

    expect(container.children[0]?.data?.source).toBe('`stable`');

    expect(container.children[1]?.data?.source).toBe(' ');

    expect(container.children[2]?.data?.source).toBeUndefined();

    expect(tree).toEqual(repairMarkdown(source, []));
  });

  test('does not recapture source from positions on a changed AST', () => {
    const tree = repairMarkdown('**bold', []);

    const container = tree.children[0];

    if (container?.type !== 'paragraph') {
      throw new Error('Expected a paragraph');
    }

    delete container.children[0]?.data?.source;

    expect(runRepairs(tree, new IncompleteStrongRepairPlugin())).toEqual(tree);
  });

  test('does not infer a code fence from a source-less code value', () => {
    const tree = root([{ type: 'code', value: 'content\n``' }]);

    expect(runRepairs(tree, new IncompleteCodeFenceRepairPlugin())).toEqual(tree);
  });
});

const removePositions = (node: Parent | RootContent): void => {
  delete node.position;

  if ('children' in node) {
    for (const child of node.children) {
      removePositions(child);
    }
  }
};
