import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { Paragraph, Root } from 'mdast';
import type { Plugin } from 'unified';

import { PluginPriority } from '@fluxdown/types';
import { first } from 'lodash-es';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { paragraph as createParagraph, root } from '../../repair/__tests__/utils';
import { AdjacentTextRepairPlugin } from '../../repair/adjacent-text';
import { BaseRepairPlugin } from '../../repair/base';
import { DanglingFootnoteRepairPlugin } from '../../repair/dangling-footnote';
import { HtmlBoundaryLineBreakRepairPlugin } from '../../repair/html-boundary-line-break';
import { IncompleteCodeFenceRepairPlugin } from '../../repair/incomplete-code-fence';
import { IncompleteEmphasisRepairPlugin } from '../../repair/incomplete-emphasis';
import { IncompleteEntityRepairPlugin } from '../../repair/incomplete-entity';
import { IncompleteHtmlTagRepairPlugin } from '../../repair/incomplete-html-tag';
import { IncompleteImageRepairPlugin } from '../../repair/incomplete-image';
import { IncompleteInlineCodeRepairPlugin } from '../../repair/incomplete-inline-code';
import { IncompleteLinkRepairPlugin } from '../../repair/incomplete-link';
import { IncompleteListMarkerRepairPlugin } from '../../repair/incomplete-list-marker';
import { IncompleteMathRepairPlugin } from '../../repair/incomplete-math';
import { IncompleteStrikethroughRepairPlugin } from '../../repair/incomplete-strikethrough';
import { IncompleteStrongRepairPlugin } from '../../repair/incomplete-strong';
import { IncompleteTableRepairPlugin } from '../../repair/incomplete-table';
import { ParagraphHtmlClosureRepairPlugin } from '../../repair/paragraph-html-closure';
import { RedundantBreakBeforeHtmlRepairPlugin } from '../../repair/redundant-break-before-html';
import { RedundantTrailingBreakRepairPlugin } from '../../repair/redundant-trailing-break';
import { TrailingEmptyCodeBlockRepairPlugin } from '../../repair/trailing-empty-code-block';
import { TrailingEmptyHeadingRepairPlugin } from '../../repair/trailing-empty-heading';
import { TrailingEscapeRepairPlugin } from '../../repair/trailing-escape';
import { ApplyRepairsRemarkPlugin } from '../apply-repairs';
import { SyntaxMathRemarkPlugin } from '../syntax-math';
import { SyntaxTableRemarkPlugin } from '../syntax-table';
import { captureRepairSource } from '../utils';
import { walkMdast } from './utils';

class RecordingRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-test-recording';

  readonly config: RepairPluginSystemConfig;

  visits = 0;

  runner: RepairPluginRunner;

  constructor(
    private readonly label: string,
    private readonly events: string[],
    config: RepairPluginSystemConfig = {},
  ) {
    super();

    this.config = config;

    this.runner = ({ node }) => {
      if (node.type === 'root') {
        this.visits += 1;

        this.events.push(this.label);
      }
    };
  }
}

const applyRepairs = (tree: Root, plugin: ApplyRepairsRemarkPlugin): Root => {
  return unified().use(plugin.plugin).runSync(tree) as Root;
};

describe('ApplyRepairsRemarkPlugin', () => {
  test('exposes only its high-priority system config', () => {
    const plugin = new ApplyRepairsRemarkPlugin({ plugins: [] });

    expect(ApplyRepairsRemarkPlugin.key).toBe('remark-apply-repairs');

    expect(plugin.config).toEqual({
      priority: PluginPriority.High,
    });
  });

  test('is a no-op with an empty explicit plugin list', () => {
    const tree = root([createParagraph([{ type: 'text', value: 'tail\\' }])]);

    const plugin = new ApplyRepairsRemarkPlugin({ plugins: [], ending: true });

    expect(applyRepairs(tree, plugin)).toEqual(tree);
  });

  test('uses the supplied instances without retaining the caller list', () => {
    const events: string[] = [];

    const repair = new RecordingRepairPlugin('instance', events);

    const late = new RecordingRepairPlugin('late', events);

    const plugins = [repair];

    const remark = new ApplyRepairsRemarkPlugin({ plugins });

    plugins.push(late);

    applyRepairs(root([]), remark);

    expect(repair.visits).toBe(1);

    expect(late.visits).toBe(0);

    expect(events).toEqual(['instance']);
  });

  test('sorts by priority while preserving input order inside a priority bucket', () => {
    const events: string[] = [];

    const low = new RecordingRepairPlugin('low', events, {
      priority: PluginPriority.Low,
    });

    const secondDefault = new RecordingRepairPlugin('default-b', events);

    const highest = new RecordingRepairPlugin('highest', events, {
      priority: PluginPriority.Highest,
    });

    const firstDefault = new RecordingRepairPlugin('default-a', events);

    applyRepairs(
      root([]),
      new ApplyRepairsRemarkPlugin({
        plugins: [low, secondDefault, highest, firstDefault],
      }),
    );

    expect(events).toEqual(['highest', 'default-b', 'default-a', 'low']);
  });

  test('filters ending-only plugins unless ending mode is enabled', () => {
    const inactiveEvents: string[] = [];

    const always = new RecordingRepairPlugin('always', inactiveEvents);

    const ending = new RecordingRepairPlugin('ending', inactiveEvents, {
      ending: true,
    });

    applyRepairs(
      root([]),
      new ApplyRepairsRemarkPlugin({ plugins: [always, ending], ending: false }),
    );

    expect(inactiveEvents).toEqual(['always']);

    const activeEvents: string[] = [];

    applyRepairs(
      root([]),
      new ApplyRepairsRemarkPlugin({
        plugins: [
          new RecordingRepairPlugin('always', activeEvents),
          new RecordingRepairPlugin('ending', activeEvents, { ending: true }),
        ],
        ending: true,
      }),
    );

    expect(activeEvents).toEqual(['always', 'ending']);
  });

  test('isolates runner errors by default and continues with later plugins', () => {
    const events: string[] = [];

    class ThrowingRepairPlugin extends BaseRepairPlugin {
      static readonly key = 'repair-test-throwing';

      runner: RepairPluginRunner = ({ node }) => {
        if (node.type === 'root') {
          throw new Error('broken repair');
        }
      };
    }

    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() =>
        applyRepairs(
          root([]),
          new ApplyRepairsRemarkPlugin({
            plugins: [new ThrowingRepairPlugin(), new RecordingRepairPlugin('after-error', events)],
          }),
        ),
      ).not.toThrow();

      expect(events).toEqual(['after-error']);

      expect(error).toHaveBeenCalledTimes(1);
    } finally {
      error.mockRestore();
    }
  });

  test('passes runner errors through when safe is false', () => {
    class ThrowingRepairPlugin extends BaseRepairPlugin {
      static readonly key = 'repair-test-throwing-unsafe';

      runner: RepairPluginRunner = ({ node }) => {
        if (node.type === 'root') {
          throw new Error('unsafe failure');
        }
      };
    }

    expect(() =>
      applyRepairs(
        root([]),
        new ApplyRepairsRemarkPlugin({
          plugins: [new ThrowingRepairPlugin()],
          safe: false,
        }),
      ),
    ).toThrow('unsafe failure');
  });

  test('preserves lifecycle ordering across multiple runners', () => {
    const events: string[] = [];

    class LifecycleRepairPlugin extends BaseRepairPlugin {
      static readonly key = 'repair-test-lifecycle';

      runner: RepairPluginRunner[] = [
        ({ node }) => {
          if (node.type === 'root') {
            events.push('runner-a');
          }
        },
        ({ node }) => {
          if (node.type === 'root') {
            events.push('runner-b');
          }
        },
      ];

      before = () => events.push('before');

      after = () => events.push('after');

      beforeEach = () => events.push('before-each');

      afterEach = () => events.push('after-each');
    }

    applyRepairs(
      root([]),
      new ApplyRepairsRemarkPlugin({ plugins: [new LifecycleRepairPlugin()] }),
    );

    expect(events).toEqual([
      'before',
      'before-each',
      'runner-a',
      'after-each',
      'before-each',
      'runner-b',
      'after-each',
      'after',
    ]);
  });

  test('runs footnote repair only when its instance is explicitly supplied', () => {
    const unchanged = root([createParagraph([{ type: 'text', value: 'text[^missing]' }])]);

    applyRepairs(unchanged, new ApplyRepairsRemarkPlugin({ plugins: [], ending: true }));

    expect(first(unchanged.children)).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', value: 'text[^missing]' }],
    });

    const repaired = root([
      createParagraph([
        { type: 'text', value: 'text[^missing]', data: { source: 'text[^missing]' } },
      ]),
    ]);

    applyRepairs(
      repaired,
      new ApplyRepairsRemarkPlugin({
        plugins: [new DanglingFootnoteRepairPlugin()],
        ending: true,
      }),
    );

    expect(first(repaired.children)).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', value: 'text' }],
    });
  });

  test.each([false, true])(
    'installs source capture once across math and repairs with math first=%s',
    (mathFirst) => {
      const repairs = new ApplyRepairsRemarkPlugin();

      const math = new SyntaxMathRemarkPlugin();

      const source = 'original';

      let reads = 0;

      const parser: Plugin<[], Root> = function () {
        this.parser = () => {
          const start = {
            line: 1,
            column: 1,
            get offset() {
              reads += 1;

              return 0;
            },
          };

          const position = { start, end: { line: 1, column: 9, offset: 8 } };

          const tree: Root = {
            type: 'root',
            children: [{ type: 'text', value: source, position }],
            position,
          };

          return tree;
        };
      };

      const processor = unified().use(parser);

      for (const plugin of mathFirst ? [math, repairs] : [repairs, math]) {
        processor.use(plugin.plugin);
      }

      const tree = processor.parse(source) as Root;

      expect(tree.data?.source).toBe(source);

      // Both nodes share this position; another capture would read it twice more.
      expect(reads).toBe(2);

      const generated = { type: 'text' as const, value: 'generated' };

      tree.children.push(generated);

      processor.runSync(tree, source);

      expect(generated).not.toHaveProperty('data.source');
    },
  );

  test('captures exact source on every parsed node before preceding transformers run', () => {
    const source = '> - **bold** and `code`\n\n| A | B |\n| - | - |\n\n```ts\nx\n```';

    const seen: string[] = [];

    const inspect: Plugin<[], Root> = () => (tree) => {
      walkMdast(tree, (node) => {
        expect(node.data?.source).toBe(
          source.slice(node.position?.start.offset, node.position?.end.offset),
        );

        seen.push(node.type);
      });

      tree.children.push({ type: 'paragraph', children: [{ type: 'text', value: 'generated' }] });
    };

    const repair = new ApplyRepairsRemarkPlugin({ plugins: [], ending: true });

    const processor = unified()
      .use(remarkParse)
      .use(new SyntaxTableRemarkPlugin().plugin)
      .use(inspect)
      .use(repair.plugin);

    const tree = processor.runSync(processor.parse(source), source);

    expect(seen).toEqual(
      expect.arrayContaining([
        'root',
        'blockquote',
        'list',
        'listItem',
        'paragraph',
        'text',
        'strong',
        'inlineCode',
        'code',
        'table',
        'tableRow',
        'tableCell',
      ]),
    );

    expect(tree.children.at(-1)?.data?.source).toBeUndefined();
  });

  test('invalidates mutated children and ancestors even when a repair throws', () => {
    class ThrowAfterMutation extends BaseRepairPlugin {
      runner: RepairPluginRunner = ({ node }) => {
        if (node.type === 'paragraph' && 'children' in node) {
          const child = node.children[0];

          if (child?.type === 'text') {
            child.value = 'changed';

            throw new Error('after mutation');
          }
        }
      };
    }

    const unchanged = { type: 'text' as const, value: 'kept', data: { source: 'kept' } };

    const tree: Root = {
      type: 'root',
      data: { source: 'original kept', custom: true },
      children: [
        {
          type: 'paragraph',
          data: { source: 'original kept' },
          children: [{ type: 'text', value: 'original', data: { source: 'original' } }, unchanged],
        },
      ],
    };

    const repair = new ApplyRepairsRemarkPlugin({
      plugins: [new ThrowAfterMutation()],
      safe: false,
    });

    expect(() => applyRepairs(tree, repair)).toThrow('after mutation');

    expect(tree.data).toEqual({ custom: true });

    expect(tree.children[0]?.data).toBeUndefined();

    expect(tree.children[0]).toMatchObject({ children: [{ value: 'changed' }, unchanged] });

    expect(unchanged.data.source).toBe('kept');
  });

  test('propagates source invalidation from a recursive subtree to every outer ancestor', () => {
    const paragraph: Paragraph = {
      type: 'paragraph',
      data: { source: 'before' },
      children: [{ type: 'text', value: 'before', data: { source: 'before' } }],
    };

    const tree: Root = {
      type: 'root',
      data: { source: '> before' },
      children: [{ type: 'blockquote', data: { source: '> before' }, children: [paragraph] }],
    };

    class RecursiveRepair extends BaseRepairPlugin {
      runner: RepairPluginRunner = ({ node, recursive, skipTree }) => {
        if (node.type === 'root') {
          recursive(paragraph);

          skipTree();
        } else if (node.type === 'text' && 'value' in node) {
          node.value = 'after';
        }
      };
    }

    applyRepairs(tree, new ApplyRepairsRemarkPlugin({ plugins: [new RecursiveRepair()] }));

    walkMdast(tree, (node) => {
      expect(node.data?.source).toBeUndefined();
    });

    expect(paragraph.children[0]).toMatchObject({ value: 'after' });
  });

  test('removes copied provenance from replacement nodes without changing unrelated siblings', () => {
    class ReplaceText extends BaseRepairPlugin {
      runner: RepairPluginRunner = ({ node, insertNext }) => {
        if (node.type === 'text' && 'value' in node && node.value === 'before') {
          insertNext([{ ...node, type: 'text', value: 'after' }], true);
        }
      };
    }

    const tree: Root = {
      type: 'root',
      data: { source: 'before kept' },
      children: [
        {
          type: 'paragraph',
          data: { source: 'before kept' },
          children: [
            { type: 'text', value: 'before', data: { source: 'before' } },
            { type: 'text', value: 'kept', data: { source: 'kept' } },
          ],
        },
      ],
    };

    applyRepairs(tree, new ApplyRepairsRemarkPlugin({ plugins: [new ReplaceText()] }));

    expect(tree.data?.source).toBeUndefined();

    expect(tree.children[0]).toMatchObject({
      children: [{ value: 'after' }, { value: 'kept', data: { source: 'kept' } }],
    });

    expect((tree.children[0] as Paragraph).children[0]?.data).toBeUndefined();
  });

  test('preserves accurate source on fresh text fragments for later independent repairs', () => {
    class SplitText extends BaseRepairPlugin {
      runner: RepairPluginRunner = ({ node }) => {
        if (node.type === 'paragraph' && 'children' in node) {
          node.children = [
            { type: 'text', value: 'prefix & ', data: { source: 'prefix &amp; ', custom: true } },
            { type: 'text', value: '**tail', data: { source: '**tail' } },
          ];
        }
      };
    }

    const source = 'prefix &amp; **tail';

    const tree = captureRepairSource(unified().use(remarkParse).parse(source), source);

    applyRepairs(
      tree,
      new ApplyRepairsRemarkPlugin({
        plugins: [new SplitText(), new IncompleteStrongRepairPlugin()],
        ending: true,
      }),
    );

    expect(tree.data?.source).toBeUndefined();

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'prefix & ', data: { source: 'prefix &amp; ', custom: true } },
        { type: 'strong', children: [{ type: 'text', value: 'tail' }] },
      ],
    });

    expect(tree.children[0]?.data?.source).toBeUndefined();
  });

  test('source capture leaves its parsed input untouched', () => {
    const source = '**bold**';

    const tree = unified().use(remarkParse).parse(source);

    const captured = captureRepairSource(tree, source);

    walkMdast(tree, (node) => {
      expect(node.data?.source).toBeUndefined();
    });

    expect(captured.data?.source).toBe(source);

    expect(captured).not.toBe(tree);
  });

  test('declares every built-in repair class in the preset', () => {
    expect(PRESET_REPAIR_PLUGINS).toEqual([
      TrailingEscapeRepairPlugin,
      TrailingEmptyCodeBlockRepairPlugin,
      IncompleteCodeFenceRepairPlugin,
      IncompleteInlineCodeRepairPlugin,
      IncompleteMathRepairPlugin,
      IncompleteImageRepairPlugin,
      IncompleteLinkRepairPlugin,
      TrailingEmptyHeadingRepairPlugin,
      IncompleteHtmlTagRepairPlugin,
      IncompleteStrongRepairPlugin,
      IncompleteEmphasisRepairPlugin,
      IncompleteStrikethroughRepairPlugin,
      IncompleteListMarkerRepairPlugin,
      IncompleteTableRepairPlugin,
      IncompleteEntityRepairPlugin,
      RedundantBreakBeforeHtmlRepairPlugin,
      HtmlBoundaryLineBreakRepairPlugin,
      ParagraphHtmlClosureRepairPlugin,
      DanglingFootnoteRepairPlugin,
      RedundantTrailingBreakRepairPlugin,
      AdjacentTextRepairPlugin,
    ]);
  });
});
