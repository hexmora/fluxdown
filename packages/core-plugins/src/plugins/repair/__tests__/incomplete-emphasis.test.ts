import type { Paragraph, PhrasingContent } from 'mdast';

import { PluginPriority } from '@fluxdown/types';
import { first } from 'lodash-es';

import { IncompleteEmphasisRepairPlugin } from '../incomplete-emphasis';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

const repairParagraph = (children: PhrasingContent[]): Paragraph => {
  const sourced = children.map((child) =>
    child.type === 'text' || child.type === 'html'
      ? { ...child, data: { source: child.value } }
      : child,
  );

  const result = runRepairs(root([paragraph(sourced)]), new IncompleteEmphasisRepairPlugin());
  const repaired = first(result.children);

  expect(repaired?.type).toBe('paragraph');

  return repaired as Paragraph;
};

describe('IncompleteEmphasisRepairPlugin', () => {
  test('exposes a matching stable key and ending-only config', () => {
    const plugin = new IncompleteEmphasisRepairPlugin();

    expect(IncompleteEmphasisRepairPlugin.key).toBe('repair-incomplete-emphasis');
    expect(plugin.config).toMatchObject({
      ending: true,
      priority: PluginPriority.Default,
    });
  });

  test('repairs an incomplete emphasis suffix in the tail paragraph', () => {
    const result = repairParagraph([
      { type: 'text', value: 'first' },
      { type: 'inlineCode', value: 'stable' },
      { type: 'text', value: '123*456' },
    ]);

    expect(result.children).toMatchObject([
      { type: 'text', value: 'first' },
      { type: 'inlineCode', value: 'stable' },
      { type: 'text', value: '123' },
      { type: 'emphasis', children: [{ type: 'text', value: '456' }] },
    ]);
  });

  test('repairs an opening delimiter preceded by whitespace when its suffix is valid', () => {
    const result = repairParagraph([{ type: 'text', value: 'prefix *suffix' }]);

    expect(result.children).toMatchObject([
      { type: 'text', value: 'prefix ' },
      { type: 'emphasis', children: [{ type: 'text', value: 'suffix' }] },
    ]);
  });

  test('removes an empty trailing emphasis marker', () => {
    const result = repairParagraph([{ type: 'text', value: 'prefix*' }]);

    expect(result.children).toMatchObject([{ type: 'text', value: 'prefix' }]);
  });

  test('keeps complete tail content unchanged', () => {
    const tree = root([paragraph([{ type: 'text', value: 'complete' }])]);

    expect(runRepairs(tree, new IncompleteEmphasisRepairPlugin())).toEqual(tree);
  });

  test('keeps a candidate that is not at the structural tail', () => {
    const tree = root([
      paragraph([
        { type: 'text', value: '123*456' },
        { type: 'inlineCode', value: 'later' },
      ]),
    ]);

    expect(runRepairs(tree, new IncompleteEmphasisRepairPlugin())).toEqual(tree);
  });

  test('keeps the same candidate outside a paragraph', () => {
    const tree = root([
      { type: 'heading', depth: 1, children: [{ type: 'text', value: '123*456' }] },
    ]);

    expect(runRepairs(tree, new IncompleteEmphasisRepairPlugin())).toEqual(tree);
  });

  test.each(['2 * 3', 'prefix * suffix', 'prefix \\*suffix'])(
    'does not force an invalid or escaped delimiter into emphasis content',
    (value) => {
      const tree = root([paragraph([{ type: 'text', value }])]);

      expect(runRepairs(tree, new IncompleteEmphasisRepairPlugin())).toEqual(tree);
    },
  );
  test.each(['_word', 'prefix _word', '（_中文', '*word * literal'])(
    'repairs valid underscore and earlier valid asterisk openers: %s',
    (source) => {
      const tree = repairMarkdown(source, new IncompleteEmphasisRepairPlugin());
      const container = tree.children[0] as Paragraph;

      expect(container.children.some((child) => child.type === 'emphasis')).toBe(true);
    },
  );

  test.each(['value_2', '中文_标识符', 'word*!', 'word_!'])(
    'preserves intraword underscores and non-opening punctuation: %s',
    (source) => {
      expect(repairMarkdown(source, new IncompleteEmphasisRepairPlugin())).toEqual(
        repairMarkdown(source, []),
      );
    },
  );
});
