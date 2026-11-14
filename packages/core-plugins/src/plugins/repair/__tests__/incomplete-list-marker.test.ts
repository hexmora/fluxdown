import type { List, Paragraph } from 'mdast';

import { PluginPriority } from '@fluxdown/types';
import { first, last } from 'lodash-es';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { IncompleteListMarkerRepairPlugin } from '../incomplete-list-marker';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

describe('IncompleteListMarkerRepairPlugin', () => {
  test('exposes a matching stable key and ending-only config', () => {
    const plugin = new IncompleteListMarkerRepairPlugin();

    expect(IncompleteListMarkerRepairPlugin.key).toBe('repair-incomplete-list-marker');
    expect(plugin.config).toMatchObject({
      ending: true,
      priority: (PluginPriority.Highest + PluginPriority.High) / 2,
    });
  });

  test.each(['2024', '0', '1234567890'])('keeps a document containing numeric prose', (value) => {
    const tree = root([paragraph([{ type: 'text', value }])]);

    expect(runRepairs(tree, new IncompleteListMarkerRepairPlugin())).toEqual(tree);
  });

  test('keeps a numeric final prose line without a list delimiter', () => {
    const tree = root([paragraph([{ type: 'text', value: 'released in\n2024' }])]);

    expect(runRepairs(tree, new IncompleteListMarkerRepairPlugin())).toEqual(tree);
  });

  test.each(['1.', '-'])('removes an explicit dangling marker on the final line', (marker) => {
    const tree = root([
      paragraph([
        { type: 'text', value: `prefix\n${marker}`, data: { source: `prefix\n${marker}` } },
      ]),
    ]);
    const result = runRepairs(tree, new IncompleteListMarkerRepairPlugin());
    const container = first(result.children) as Paragraph;

    expect(container.children).toEqual([{ type: 'text', value: 'prefix' }]);
  });

  test.each(['  1.', '   +', '  *', '  2)'])(
    'removes an indented dangling marker on the final line: %s',
    (marker) => {
      const tree = root([
        paragraph([
          { type: 'text', value: `prefix\n${marker}`, data: { source: `prefix\n${marker}` } },
        ]),
      ]);
      const result = runRepairs(tree, new IncompleteListMarkerRepairPlugin());
      const container = first(result.children) as Paragraph;

      expect(container.children).toEqual([{ type: 'text', value: 'prefix' }]);
    },
  );

  test('repairs a dangling marker in the final paragraph of a list item', () => {
    const list: List = {
      type: 'list',
      ordered: true,
      children: [
        {
          type: 'listItem',
          children: [
            paragraph([{ type: 'text', value: 'item\n2.', data: { source: 'item\n2.' } }]),
          ],
        },
      ],
    };
    const result = runRepairs(root([list]), new IncompleteListMarkerRepairPlugin());
    const repairedList = last(result.children) as List;
    const item = last(repairedList.children);
    const container = last(item?.children ?? []) as Paragraph;

    expect(container.children).toEqual([{ type: 'text', value: 'item' }]);
  });

  test('does not repair a marker outside the structural tail', () => {
    const tree = root([
      paragraph([{ type: 'text', value: 'prefix\n1.' }]),
      paragraph([{ type: 'text', value: 'tail' }]),
    ]);

    expect(runRepairs(tree, new IncompleteListMarkerRepairPlugin())).toEqual(tree);
  });

  test('does not run outside ending mode', () => {
    const tree = root([paragraph([{ type: 'text', value: 'prefix\n1.' }])]);

    expect(runRepairs(tree, new IncompleteListMarkerRepairPlugin(), { ending: false })).toEqual(
      tree,
    );
  });
  test.each(['-', '+', '*', '1.', '2)'])(
    'hides a parsed empty final item and restores it when generation ends: %s',
    (marker) => {
      const plugin = new IncompleteListMarkerRepairPlugin();
      const source = `${marker} content\n${marker}`;
      const tree = repairMarkdown(source, plugin);

      expect((tree.children[0] as List).children).toHaveLength(1);
      expect(repairMarkdown(marker, plugin).children).toEqual([]);
      expect(repairMarkdown(source, plugin, { ending: false })).toEqual(repairMarkdown(source, []));
    },
  );

  test.each(['word **bold**-', 'prefix\n    -', 'prefix\n1234567890.', '-literal', 'word -'])(
    'keeps a literal that cannot be a list marker: %s',
    (source) => {
      expect(repairMarkdown(source, new IncompleteListMarkerRepairPlugin())).toEqual(
        repairMarkdown(source, []),
      );
    },
  );

  test.each(['0', '12', '2026', '123456789', 'prefix\n42', '> 42', '- item\n  12'])(
    'holds a bare numeric list candidate only while the line can still grow: %s',
    (source) => {
      const plugin = new IncompleteListMarkerRepairPlugin();

      expect(repairMarkdown(source, plugin)).not.toEqual(repairMarkdown(source, []));
      expect(repairMarkdown(source, plugin, { ending: false })).toEqual(repairMarkdown(source, []));
    },
  );

  test.each([
    '1234567890',
    'price 12',
    '12 ',
    '12\n',
    '12 people',
    '12.5',
    'version 2.1.4',
    '1)word',
    '    12',
    '&#49;',
  ])('restores a number as soon as it cannot become a list marker: %s', (source) => {
    expect(repairMarkdown(source, new IncompleteListMarkerRepairPlugin())).toEqual(
      repairMarkdown(source, []),
    );
  });

  test.each(['[', '[ ', '[x', '[X', '[ ]', '[x]'])(
    'holds an ambiguous task marker without inventing a link: %s',
    (marker) => {
      const plugins = PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin());
      const tree = repairMarkdown(`- ${marker}`, plugins);
      expect(tree.children).toEqual([]);
      expect(repairMarkdown(`- ${marker}`, plugins, { ending: false })).toEqual(
        repairMarkdown(`- ${marker}`, []),
      );
    },
  );

  test('shows text as soon as a task-marker prefix becomes ordinary bracketed prose', () => {
    const plugins = PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin());
    const tree = repairMarkdown('- [xyz] note', plugins);
    const item = (tree.children[0] as List).children[0];

    expect(item?.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', value: '[xyz] note' }],
    });
  });

  test('holds a two-hyphen thematic-break prefix and restores ordinary text', () => {
    const plugin = new IncompleteListMarkerRepairPlugin();

    expect(repairMarkdown('--', plugin).children[0]).toMatchObject({
      type: 'paragraph',
      children: [],
    });
    expect(repairMarkdown('--word', plugin)).toEqual(repairMarkdown('--word', []));
    expect(repairMarkdown('---', plugin)).toEqual(repairMarkdown('---', []));
    expect(repairMarkdown('--', plugin, { ending: false })).toEqual(repairMarkdown('--', []));
  });
});
