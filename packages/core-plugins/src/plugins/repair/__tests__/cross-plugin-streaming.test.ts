import type { IRepairPlugin, RepairPluginRunner } from '@fluxdown/types';
import type { Parent, Root, RootContent, TableCell } from 'mdast';

import { cloneDeep, noop, sortBy } from 'lodash-es';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { processRepairByPlugins } from '../../../utils';
import { parseMarkdown, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxAutolinkRemarkPlugin } from '../../remark/syntax-autolink';
import { SyntaxStrikethroughRemarkPlugin } from '../../remark/syntax-strikethrough';
import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { IncompleteMathRepairPlugin } from '../incomplete-math';
import { IncompleteStrongRepairPlugin } from '../incomplete-strong';
import { IncompleteTableRepairPlugin } from '../incomplete-table';
import {
  isOpenRepairTableCell,
  OPEN_REPAIR_TABLE_CELL,
  type OpenRepairTableCellNode,
} from '../utils';

const table = '| Key | Value |\n|---|---|\n| row | ';

const parse = (source: string, ending = true): Root =>
  parseMarkdown(source, [
    new SyntaxAutolinkRemarkPlugin(),
    new SyntaxStrikethroughRemarkPlugin(),
    new SyntaxTableRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({
      plugins: PRESET_REPAIR_PLUGINS.filter((Plugin) => Plugin !== IncompleteMathRepairPlugin).map(
        (Plugin) => new Plugin(),
      ),
      ending,
      safe: false,
    }),
  ]);

const lastCell = (tree: Root): TableCell => {
  let cell: TableCell | undefined;

  walkMdast(tree, (node) => {
    if (node.type === 'tableCell') {
      cell = node;
    }
  });

  if (!cell) {
    throw new Error('Expected a table cell');
  }

  return cell;
};

const tokens = (node: Parent | RootContent, roles: string[] = []): unknown[] => {
  const nextRoles = ['emphasis', 'strong', 'delete', 'inlineCode', 'link'].includes(node.type)
    ? sortBy([...roles, node.type])
    : roles;

  if ('value' in node) {
    return Array.from(node.value, (value) => ({ value, roles: nextRoles }));
  }

  if (node.type === 'image' && 'alt' in node) {
    return [{ image: node.alt, url: node.url }];
  }

  return 'children' in node ? node.children.flatMap((child) => tokens(child, nextRoles)) : [];
};

describe('composed repairs in streamed table cells', () => {
  test.each([
    '**alpha `beta` gamma**',
    '*alpha `beta` gamma*',
    '~~alpha `beta` gamma~~',
    '*alpha **beta** gamma*',
    '~~alpha **beta** gamma~~',
    '**[alpha](https://example.test)**',
    '[**alpha**](https://example.test)',
    '![**alpha**](https://example.test)',
    '[alpha &amp; beta](https://example.test)',
    String.raw`[alpha \*beta\*](https://example.test)`,
    '**alpha <span title="value">beta</span> gamma**',
    '**alpha &amp; beta**',
    String.raw`**alpha \*beta\* gamma**`,
  ])('matches paragraph repair through every prefix of %s', (markup) => {
    for (let offset = 1; offset <= markup.length; offset += 1) {
      const partial = markup.slice(0, offset);

      expect({ partial, tokens: tokens(lastCell(parse(table + partial))) }).toEqual({
        partial,
        tokens: tokens(parse(partial)),
      });
    }

    expect(parse(table + markup + ' |')).toEqual(parse(table + markup + ' |', false));
  });
});

describe('block boundary repairs after inline replacements', () => {
  test.each(['**parent', '*parent', '~~parent', '[parent', '![parent', 'parent <span title="open'])(
    'keeps a pending nested-list underline out of heading mode after repairing %s',
    (content) => {
      const source = '- ' + content + '\n  -';

      const tree = parse(source);

      const list = tree.children[0];

      expect(list).toMatchObject({
        type: 'list',
        children: [{ type: 'listItem', children: [{ type: 'paragraph' }] }],
      });
    },
  );
});

const inspectPlugin = (runner: RepairPluginRunner): IRepairPlugin => ({
  config: { scope: 'tail' },
  runner,
  before: noop,
  after: noop,
  beforeEach: noop,
  afterEach: noop,
  destroy: noop,
});

const expectNoBoundaryMetadata = (tree: Root) => {
  walkMdast(tree, (node) => {
    expect(Object.getOwnPropertySymbols(node)).not.toContain(OPEN_REPAIR_TABLE_CELL);
  });
};

describe('per-pass open-cell boundary lifetime', () => {
  test('retains source validation through reference cloning and clears temporary metadata', () => {
    const source = table + '[first][id] and **[second](url';

    const tree = parse(source);

    expect(tokens(lastCell(tree))).toEqual(tokens(parse('[first][id] and **[second](url')));

    expect(lastCell(tree).data?.source).toBeUndefined();

    expectNoBoundaryMetadata(tree);
  });

  test.each(['', '> ', '> > '])(
    'keeps exact literal provenance through composed repairs: %s',
    (quote) => {
      const prefix = table
        .split('\n')
        .map((line) => quote + line)
        .join('\n');

      for (const markup of [String.raw`**alpha \*literal\* &amp; ` + '`code', '~~alpha **beta']) {
        const tree = parse(prefix + markup);

        expect(tokens(lastCell(tree))).toEqual(tokens(parse(markup)));

        expectNoBoundaryMetadata(tree);
      }
    },
  );

  test.each(['|', '| ', '\n', '\r\n', '| extra |'])(
    'does not enable composition for a physically closed cell: %j',
    (suffix) => {
      const source = table + '**alpha `beta' + suffix;

      expect(parse(source)).toEqual(parse(source, false));

      expectNoBoundaryMetadata(parse(source));
    },
  );

  test.each(['root', 'table', 'tableRow', 'tableCell'])(
    'requires original source on every boundary ancestor: %s',
    (type) => {
      const tree = parse(table + '**alpha', false);

      walkMdast(tree, (node) => {
        if (node.type === type) {
          delete node.data?.source;
        }
      });

      const original = structuredClone(tree);

      processRepairByPlugins({
        node: tree,
        plugins: [new IncompleteStrongRepairPlugin()],
        ending: true,
      });

      expect(tree).toEqual(original);

      expectNoBoundaryMetadata(tree);
    },
  );

  test('does not preserve a boundary when ending repair is disabled', () => {
    const tree = parse(table + '**alpha', false);

    processRepairByPlugins({
      node: tree,
      ending: false,
      plugins: [
        new IncompleteTableRepairPlugin(),
        inspectPlugin(({ node }) => {
          expect(Object.getOwnPropertySymbols(node)).not.toContain(OPEN_REPAIR_TABLE_CELL);
        }),
      ],
    });

    expectNoBoundaryMetadata(tree);
  });

  test.each(['spread', 'deep'])('cleans %s cloned cells after a plugin throws', (cloneMode) => {
    const tree = parse(table + '**alpha', false);

    const original = lastCell(tree) as OpenRepairTableCellNode;

    let retained: (() => boolean) | undefined;

    expect(() =>
      processRepairByPlugins({
        node: tree,
        ending: true,
        safe: false,
        plugins: [
          new IncompleteTableRepairPlugin(),
          inspectPlugin(({ node, parent, index }) => {
            if (node.type !== 'tableCell' || !parent || index === undefined) {
              return;
            }

            const cloned = (cloneMode === 'deep' ? cloneDeep(node) : { ...node }) as RootContent;

            retained = (cloned as OpenRepairTableCellNode)[OPEN_REPAIR_TABLE_CELL];

            parent.children[index] = cloned;

            throw new Error('expected repair failure');
          }),
        ],
      }),
    ).toThrow('expected repair failure');

    expect(retained?.()).toBe(false);

    expect(original[OPEN_REPAIR_TABLE_CELL]).toBeUndefined();

    expectNoBoundaryMetadata(tree);

    expect(tokens(lastCell(parse(table + '**alpha')))).toEqual(tokens(parse('**alpha')));
  });

  test('does not authorize a subsequent pass with deep-cloned boundary metadata', () => {
    const tree = parse(table + '**literal', false);

    processRepairByPlugins({
      node: tree,
      ending: true,
      plugins: [
        new IncompleteTableRepairPlugin(),
        inspectPlugin(({ node, parent, index }) => {
          if (node.type === 'tableCell' && parent && index !== undefined) {
            parent.children[index] = cloneDeep(node) as RootContent;
          }
        }),
      ],
    });

    expect(lastCell(tree).data?.source).toBeUndefined();

    expectNoBoundaryMetadata(tree);

    const original = structuredClone(tree);

    processRepairByPlugins({
      node: tree,
      ending: true,
      plugins: [new IncompleteStrongRepairPlugin()],
    });

    expect(tree).toEqual(original);

    expectNoBoundaryMetadata(tree);
  });

  test('makes the retained boundary available inside recursive repair calls', () => {
    const tree = parse(table + '**alpha', false);

    let visitedCell = false;

    const plugin = inspectPlugin(({ node, parents, recursive, skipTree }) => {
      if (node.type === 'root' && 'children' in node) {
        recursive(node.children[0] as Parent);

        skipTree();

        return;
      }

      if (node.type === 'tableCell') {
        delete node.data?.source;

        visitedCell = isOpenRepairTableCell(node, parents);
      }
    });

    processRepairByPlugins({
      node: tree,
      ending: true,
      plugins: [new IncompleteTableRepairPlugin(), plugin],
    });

    expect(visitedCell).toBe(true);

    expectNoBoundaryMetadata(tree);
  });

  test('does not prepare a table boundary when table syntax is disabled', () => {
    const tree = parse(table + '**alpha', false);

    const plugin = new IncompleteTableRepairPlugin();

    plugin.context = {
      config: {
        repair: true,
        repairEnding: true,
        footnote: false,
        tex: false,
        indentedCode: true,
        setextHeading: true,
      },
      remarks: [],
      repairs: [],
    };

    let retained = false;

    processRepairByPlugins({
      node: tree,
      ending: true,
      plugins: [
        plugin,
        inspectPlugin(({ node }) => {
          retained ||= OPEN_REPAIR_TABLE_CELL in node;
        }),
      ],
    });

    expect(retained).toBe(false);

    expectNoBoundaryMetadata(tree);
  });

  test('does not retain a table boundary when its repair plugin is absent', () => {
    const tree = parse(table + '**alpha', false);

    let retained = false;

    processRepairByPlugins({
      node: tree,
      ending: true,
      plugins: [
        inspectPlugin(({ node }) => {
          retained ||= OPEN_REPAIR_TABLE_CELL in node;
        }),
      ],
    });

    expect(retained).toBe(false);

    expectNoBoundaryMetadata(tree);
  });

  test('does not reuse a previous pass boundary after its source has been consumed', () => {
    const tree = parse(table + '**alpha `beta');

    const cell = lastCell(tree);

    cell.children.push({ type: 'text', value: '**literal', data: { source: '**literal' } });

    const original = structuredClone(tree);

    processRepairByPlugins({
      node: tree,
      ending: true,
      plugins: [new IncompleteStrongRepairPlugin()],
    });

    expect(tree).toEqual(original);

    expectNoBoundaryMetadata(tree);
  });
});
