import type { Parent, Root, RootContent, TableCell } from 'mdast';

import { sortBy } from 'lodash-es';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { parseMarkdown, stripPositions, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxStrikethroughRemarkPlugin } from '../../remark/syntax-strikethrough';
import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { IncompleteEmphasisRepairPlugin } from '../incomplete-emphasis';
import { IncompleteMathRepairPlugin } from '../incomplete-math';
import { IncompleteStrikethroughRepairPlugin } from '../incomplete-strikethrough';
import { IncompleteStrongRepairPlugin } from '../incomplete-strong';
import { runRepairs } from './utils';

const table = '| Key | Value |\n|---|---|\n| row | ';

const parse = (source: string, ending = true, singleTilde = true) =>
  parseMarkdown(source, [
    new SyntaxTableRemarkPlugin(),
    new SyntaxStrikethroughRemarkPlugin({ singleTilde }),
    new ApplyRepairsRemarkPlugin({
      plugins: PRESET_REPAIR_PLUGINS.filter((Plugin) => Plugin !== IncompleteMathRepairPlugin).map(
        (Plugin) =>
          Plugin === IncompleteStrikethroughRepairPlugin
            ? new IncompleteStrikethroughRepairPlugin({ singleTilde })
            : new Plugin(),
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
  const nextRoles = ['emphasis', 'strong', 'delete', 'inlineCode'].includes(node.type)
    ? sortBy([...roles, node.type])
    : roles;

  if ((node.type === 'text' || node.type === 'inlineCode') && 'value' in node) {
    return Array.from(node.value, (value) => ({ value, roles: nextRoles }));
  }

  return 'children' in node ? node.children.flatMap((child) => tokens(child, nextRoles)) : [];
};

describe('emphasis, strong and strikethrough in open table cells', () => {
  test.each([
    '*alpha*',
    '_alpha_',
    '**alpha**',
    '__alpha__',
    '***alpha***',
    '~~alpha~~',
    '~alpha~',
  ])('matches paragraph repair semantics through every prefix of %s', (markup) => {
    for (const quote of ['', '> ', '> > ']) {
      const prefix = table
        .split('\n')
        .map((line) => quote + line)
        .join('\n');

      for (let offset = 1; offset <= markup.length; offset += 1) {
        const partial = markup.slice(0, offset);

        expect({ partial, tokens: tokens(lastCell(parse(prefix + partial))) }).toEqual({
          partial,
          tokens: tokens(parse(partial)),
        });
      }
    }
  });

  test.each(['**A *alpha* Z**', '**A ~~alpha~~ Z**'])(
    'keeps outer strong and a nested delimiter stable through every prefix of %s',
    (markup) => {
      for (let offset = 1; offset <= markup.length; offset += 1) {
        const partial = markup.slice(0, offset);

        expect({ partial, tokens: tokens(lastCell(parse(table + partial))) }).toEqual({
          partial,
          tokens: tokens(parse(partial)),
        });
      }
    },
  );

  test.each(['*', '_', '**', '__', '~~', '~'])(
    'does not repair %s after the cell or physical row has closed',
    (marker) => {
      for (const suffix of ['|', '| ', '\n', '\r\n', '| another |']) {
        const source = table + marker + 'literal ' + suffix;

        expect(parse(source)).toEqual(parse(source, false));
      }
    },
  );

  test.each([
    String.raw`\*literal`,
    String.raw`\_literal`,
    String.raw`\*\*literal`,
    String.raw`\_\_literal`,
    String.raw`\~\~literal`,
    '&#42;literal',
    '&#95;literal',
    '&#126;literal',
    'a_b',
    '中文_标识符',
    '2 * 3',
    'a ~~ b',
    '`*literal **literal ~~literal`',
    '**literal _inside**',
    '_literal **inside_',
  ])('preserves escaped, literal and completed content: %s', (content) => {
    expect(parse(table + content)).toEqual(parse(table + content, false));
  });

  test.each(['~~alpha~~', '~alpha~'])(
    'respects the configured single-tilde syntax through prefixes of %s',
    (markup) => {
      for (let offset = 1; offset <= markup.length; offset += 1) {
        const partial = markup.slice(0, offset);

        expect(tokens(lastCell(parse(table + partial, true, false)))).toEqual(
          tokens(parse(partial, true, false)),
        );
      }
    },
  );

  test.each(['*alpha*', '**alpha**', '~~alpha~~'])(
    'works in a list-nested table and restores exact completed markup: %s',
    (markup) => {
      const prefix =
        '- item\n\n' +
        table
          .split('\n')
          .map((line) => '  ' + line)
          .join('\n');

      for (let offset = 1; offset <= markup.length; offset += 1) {
        const partial = markup.slice(0, offset);

        expect(tokens(lastCell(parse(prefix + partial)))).toEqual(tokens(parse(partial)));
      }

      expect(parse(prefix + markup + ' |')).toEqual(parse(prefix + markup + ' |', false));
    },
  );

  test.each([
    ['*alpha', new IncompleteEmphasisRepairPlugin()],
    ['**alpha', new IncompleteStrongRepairPlugin()],
    ['~~alpha', new IncompleteStrikethroughRepairPlugin()],
  ] as const)(
    'requires current source provenance, without consulting positions: %s',
    (markup, plugin) => {
      const source = table + markup;

      const original = parse(source, false);

      expect(runRepairs(stripPositions(original), plugin)).toEqual(stripPositions(parse(source)));

      for (const type of ['root', 'table', 'tableRow', 'tableCell']) {
        const missing = structuredClone(original);

        walkMdast(missing, (node) => {
          if (node.type === type) {
            delete node.data?.source;
          }
        });

        expect(runRepairs(missing, plugin)).toEqual(missing);
      }

      const repaired = parse(source);

      expect(repaired.data?.source).toBeUndefined();

      expect(lastCell(repaired).data?.source).toBeUndefined();
    },
  );

  test.each([
    '_A __alpha__ Z_',
    '~~A __alpha__ Z~~',
    '~~A *alpha* Z~~',
    '**A `alpha` Z**',
    '~~A `alpha` Z~~',
  ])(
    'preserves completed nested markup when earlier repairs consumed the open-cell proof: %s',
    (markup) => {
      expect(parse(table + markup + ' |')).toEqual(parse(table + markup + ' |', false));
    },
  );
});
