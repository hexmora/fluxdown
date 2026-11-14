import type { IRepairPlugin } from '@fluxdown/types';
import type { Parent, Root, RootContent, TableCell } from 'mdast';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { parseMarkdown, stripPositions, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxAutolinkRemarkPlugin } from '../../remark/syntax-autolink';
import { SyntaxStrikethroughRemarkPlugin } from '../../remark/syntax-strikethrough';
import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { IncompleteImageRepairPlugin } from '../incomplete-image';
import { IncompleteLinkRepairPlugin } from '../incomplete-link';
import { runRepairs } from './utils';

const table = '| Key | Value |\n|---|---|\n| row | ';

const resources = [new IncompleteImageRepairPlugin(), new IncompleteLinkRepairPlugin()];

const parse = (
  source: string,
  ending = true,
  plugins: IRepairPlugin[] = PRESET_REPAIR_PLUGINS.filter(
    (Plugin) => Plugin.key !== 'repair-incomplete-math',
  ).map((Plugin) => new Plugin()),
) =>
  parseMarkdown(source, [
    new SyntaxTableRemarkPlugin(),
    new SyntaxAutolinkRemarkPlugin(),
    new SyntaxStrikethroughRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({ plugins, ending, safe: false }),
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
  const nextRoles = ['link', 'image', 'strong', 'emphasis', 'delete', 'inlineCode'].includes(
    node.type,
  )
    ? [...roles, node.type]
    : roles;

  if (node.type === 'image' && 'alt' in node) {
    return Array.from(node.alt ?? '', (value) => ({ value, roles: nextRoles }));
  }

  if ('value' in node) {
    return Array.from(node.value, (value) => ({ value, roles: nextRoles }));
  }

  return 'children' in node ? node.children.flatMap((child) => tokens(child, nextRoles)) : [];
};

describe('resources in an open table cell', () => {
  test.each([
    '| Value |\n|---|\n| ',
    table,
    'Key | Value\n--- | ---\nrow | ',
    '| A | B | C |\n|---|---|---|\n| row | ',
    table
      .split('\n')
      .map((line) => '> ' + line)
      .join('\n'),
    table
      .split('\n')
      .map((line) => '> > ' + line)
      .join('\n'),
    '- item\n\n' +
      table
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n'),
  ])('matches paragraph semantics through Unicode prefixes in %s', (prefix) => {
    for (const marker of ['[', '![']) {
      const markup = marker + '文档🚀](https://example.test/a_(b) "说明 🚀")';

      let partial = '';

      for (const character of markup) {
        partial += character;

        expect({ partial, tokens: tokens(lastCell(parse(prefix + partial))) }).toEqual({
          partial,
          tokens: tokens(parse(partial)),
        });
      }

      expect(parse(prefix + markup + ' |')).toEqual(parse(prefix + markup + ' |', false));
    }
  });

  test.each([
    '[**粗体🚀**](https://example.test)',
    '[*强调🚀*](<https://example.test/a_(b)> "标题")',
    '[~~删除🚀~~](https://example.test)',
    '![**图片🚀**](/demo-image.svg "图片")',
  ])('preserves formatted labels through every Unicode prefix: %s', (markup) => {
    let partial = '';

    for (const character of markup) {
      partial += character;

      expect({ partial, tokens: tokens(lastCell(parse(table + partial))) }).toEqual({
        partial,
        tokens: tokens(parse(partial)),
      });
    }
  });

  test.each(['[', '!['])(
    'preserves completed code and escaped label semantics while %s destination arrives',
    (marker) => {
      const label = marker + '**`[`** 文档 \\* &amp; `code`](';

      let partial = label;

      for (const character of 'https://example.test/a\\(b\\) "标题 🚀")') {
        partial += character;

        expect({ partial, tokens: tokens(lastCell(parse(table + partial))) }).toEqual({
          partial,
          tokens: tokens(parse(partial)),
        });
      }

      expect(parse(table + partial)).toEqual(parse(table + partial, false));
    },
  );

  test.each(['<https://example.test/path>', '<review@example.test>'])(
    'also repairs an unfinished angle resource in the physical tail cell: %s',
    (markup) => {
      let partial = '';

      for (const character of markup) {
        partial += character;

        expect({
          partial,
          tokens: tokens(lastCell(parse(table + partial, true, resources))),
        }).toEqual({
          partial,
          tokens: tokens(parse(partial, true, resources)),
        });
      }
    },
  );

  test.each(['[literal](url', '![literal](/image.svg', '[literal', '![literal'])(
    'does not repair a closed cell or row containing %s',
    (markup) => {
      for (const suffix of ['|', '| ', '| next |', '\n', '\r\n', '\n\nAfter']) {
        const source = table + markup + suffix;

        expect(parse(source, true, resources)).toEqual(parse(source, false, resources));
      }
    },
  );

  test.each([
    String.raw`\[literal`,
    String.raw`\![literal`,
    String.raw`!\[literal`,
    '&#91;literal',
    '&#33;&#91;literal',
    '`[literal](url`',
    '`![literal](/image.svg`',
    '*literal [bracket*',
    '**literal ![image**',
    '[label] ordinary text',
    '[label](url plain text',
    '![label] ordinary text',
    '![label](url plain text',
  ])('preserves escaped syntax, opaque content and invalid continuations: %s', (markup) => {
    const source = table + markup;

    expect(parse(source, true, resources)).toEqual(parse(source, false, resources));
  });

  test.each(['[label', '[label](url "title', '![alt', '![alt](/image.svg', '!'])(
    'restores exact native output when ending repair is disabled: %s',
    (markup) => {
      const source = table + markup;

      expect(parse(source, false, resources)).toEqual(parse(source, false, []));
    },
  );

  test('keeps existing content when incomplete images are discarded', () => {
    const tree = parse(table + '**before** ![alt](/image.svg', true, [
      new IncompleteImageRepairPlugin({ strategy: 'discard' }),
    ]);

    expect(lastCell(tree).children).toMatchObject([
      { type: 'strong', children: [{ type: 'text', value: 'before' }] },
      { type: 'text', value: ' ' },
    ]);
  });

  test.each([
    ['[label](url', new IncompleteLinkRepairPlugin()],
    ['![alt](/image.svg', new IncompleteImageRepairPlugin()],
  ] as const)('requires accurate source without consulting positions: %s', (markup, plugin) => {
    const source = table + markup;

    const original = parse(source, false);

    expect(runRepairs(stripPositions(original), plugin)).toEqual(
      stripPositions(parse(source, true, [plugin])),
    );

    for (const type of ['root', 'table', 'tableRow', 'tableCell', 'text']) {
      const missing = structuredClone(original);

      walkMdast(missing, (node) => {
        if (node.type === type) {
          delete node.data?.source;
        }
      });

      expect(runRepairs(missing, plugin)).toEqual(missing);
    }

    const repaired = parse(source, true, [plugin]);

    expect(repaired.data?.source).toBeUndefined();

    expect(lastCell(repaired).data?.source).toBeUndefined();
  });
});
