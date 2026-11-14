import { PluginPriority } from '@fluxdown/types';

import { IncompleteStrikethroughRepairPlugin } from '../incomplete-strikethrough';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

describe('IncompleteStrikethroughRepairPlugin', () => {
  test('exposes a stable key and ending-only tail config', () => {
    const plugin = new IncompleteStrikethroughRepairPlugin();

    expect(IncompleteStrikethroughRepairPlugin.key).toBe('repair-incomplete-strikethrough');

    expect(plugin.config).toMatchObject({
      scope: 'tail',
      ending: true,
      priority: PluginPriority.Default,
    });
  });

  test.each(['~word', '~~word', '~~word~'])(
    'repairs source-backed incomplete deletion: %s',
    (source) => {
      expect(
        repairMarkdown(source, new IncompleteStrikethroughRepairPlugin()).children[0],
      ).toMatchObject({
        type: 'paragraph',
        children: [{ type: 'delete', children: [{ type: 'text', value: 'word' }] }],
      });
    },
  );

  test.each(['~word', 'prefix ~', 'word~'])(
    'keeps single tilde text when single-tilde syntax is disabled: %s',
    (source) => {
      expect(
        repairMarkdown(source, new IncompleteStrikethroughRepairPlugin({ singleTilde: false })),
      ).toEqual(repairMarkdown(source, []));
    },
  );

  test.each(['~~word', '~~word~'])(
    'repairs double tilde prefixes while single-tilde syntax is disabled: %s',
    (source) => {
      expect(
        repairMarkdown(source, new IncompleteStrikethroughRepairPlugin({ singleTilde: false }))
          .children[0],
      ).toMatchObject({
        type: 'paragraph',
        children: [{ type: 'delete', children: [{ type: 'text', value: 'word' }] }],
      });
    },
  );

  test('skips source-less candidates and non-tail paragraphs', () => {
    const tree = root([paragraph([{ type: 'text', value: '~~literal' }])]);

    expect(runRepairs(tree, new IncompleteStrikethroughRepairPlugin())).toEqual(tree);

    const source = '~~literal\n\nlater';

    expect(repairMarkdown(source, new IncompleteStrikethroughRepairPlugin())).toEqual(
      repairMarkdown(source, []),
    );
  });
});
