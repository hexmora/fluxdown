import type { PhrasingContent } from 'mdast';

import { PluginPriority } from '@fluxdown/types';

import { TrailingEmptyHeadingRepairPlugin } from '../trailing-empty-heading';
import { paragraph, root, runRepairs } from './utils';

describe('TrailingEmptyHeadingRepairPlugin', () => {
  test('exposes a matching stable key and ending-only config', () => {
    const plugin = new TrailingEmptyHeadingRepairPlugin();

    expect(TrailingEmptyHeadingRepairPlugin.key).toBe('repair-trailing-empty-heading');
    expect(plugin.config).toMatchObject({
      ending: true,
      priority: PluginPriority.Default,
    });
  });

  test.each<{ children: PhrasingContent[] }>([
    { children: [{ type: 'text', value: '   ' }] },
    { children: [] },
  ])('removes a trailing empty level-one heading', ({ children }) => {
    const tree = root([
      paragraph([{ type: 'text', value: 'prefix' }]),
      { type: 'heading', depth: 1, children },
    ]);
    const result = runRepairs(tree, new TrailingEmptyHeadingRepairPlugin());

    expect(result.children).toHaveLength(1);
  });

  test.each<1 | 2 | 3 | 4 | 5 | 6>([1, 2, 3, 4, 5, 6])(
    'hides every empty heading depth: %s',
    (depth) => {
      const tree = root([{ type: 'heading', depth, children: [] }]);

      expect(runRepairs(tree, new TrailingEmptyHeadingRepairPlugin()).children).toEqual([]);
      expect(runRepairs(tree, new TrailingEmptyHeadingRepairPlugin(), { ending: false })).toEqual(
        tree,
      );
    },
  );

  test('keeps an empty level-one heading that is not last', () => {
    const tree = root([
      { type: 'heading', depth: 1, children: [] },
      paragraph([{ type: 'text', value: 'suffix' }]),
    ]);

    expect(runRepairs(tree, new TrailingEmptyHeadingRepairPlugin())).toEqual(tree);
  });

  test('keeps a non-empty trailing level-one heading', () => {
    const tree = root([
      { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Heading' }] },
    ]);

    expect(runRepairs(tree, new TrailingEmptyHeadingRepairPlugin())).toEqual(tree);
  });
});
