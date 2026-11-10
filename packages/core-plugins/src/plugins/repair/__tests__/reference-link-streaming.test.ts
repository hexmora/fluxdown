import type { Parent, RootContent } from 'mdast';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { parseMarkdown, stripPositions, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxAutolinkRemarkPlugin } from '../../remark/syntax-autolink';
import { SyntaxMathRemarkPlugin } from '../../remark/syntax-math';
import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { IncompleteLinkRepairPlugin } from '../incomplete-link';
import { getPendingReferenceTree } from '../incomplete-link/utils';
import { paragraph, root, runRepairs } from './utils';

const parse = (source: string, ending = true) =>
  parseMarkdown(source, [
    new SyntaxAutolinkRemarkPlugin(),
    new SyntaxTableRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({
      plugins: PRESET_REPAIR_PLUGINS.filter(
        (Plugin) => Plugin.key !== 'repair-incomplete-math',
      ).map((Plugin) => new Plugin()),
      ending,
      safe: false,
    }),
  ]);

const text = (node: Parent | RootContent): string =>
  'value' in node ? node.value : 'children' in node ? node.children.map(text).join('') : '';

const firstLink = (source: string) => {
  const container = parse(source).children[0];

  return container && 'children' in container
    ? container.children.find((node) => node.type === 'link' || node.type === 'linkReference')
    : undefined;
};

describe('reference link stability', () => {
  test.each(['[manual][]', '[second][manual]', '[second](https://example.test "Title")'])(
    'repairs every prefix of a second link after replacing the first reference: %s',
    (second) => {
      const prefix = '[first][manual] and ';

      let suffix = '';

      for (const character of second) {
        suffix += character;

        const source = prefix + suffix;

        const tree = parse(source);

        expect({ source, text: text(tree) }).toEqual({
          source,
          text: 'first and ' + text(parse(suffix)),
        });

        const container = tree.children[0];

        if (suffix.length > 1) {
          expect(container).toMatchObject({
            type: 'paragraph',
            children: [{ type: 'link' }, { type: 'text' }, { type: 'link' }],
          });
        }
      }
    },
  );

  test.each(['manual', '中文🚀', 'Manual Name', String.raw`manual\*`, String.raw`manual\]`])(
    'holds every prefix of a later definition for an unresolved reference: %s',
    (identifier) => {
      const prefix = '[first][' + identifier + '] and [second][' + identifier + '].\n\n';

      const definition = '[' + identifier + ']: https://example.test/manual "Guide title"';

      let source = prefix;

      for (const character of definition) {
        source += character;

        expect({ source, text: text(parse(source)) }).toEqual({
          source,
          text: 'first and second.',
        });
      }

      expect(parse(source)).toEqual(parse(source, false));
    },
  );

  test.each(['', '> ', '- ', '## ', '| Example |\n| --- |\n| '])(
    'keeps every link stable in a container after reference replacement: %s',
    (container) => {
      const prefix = container + '[first][manual] and ';

      let suffix = '';

      for (const character of '[第二🚀](https://example.test "Title")') {
        suffix += character;

        const labels: string[] = [];

        walkMdast(parse(prefix + suffix), (node) => {
          if (node.type === 'link' || node.type === 'linkReference') {
            labels.push(text(node));
          }
        });

        const label = [...suffix.slice(1).split(']')[0]!].slice(0, 3).join('');

        expect({ suffix, labels }).toEqual({
          suffix,
          labels: ['first', ...(label ? [label] : [])],
        });
      }
    },
  );

  test('restores a held definition label at explicit stream completion', () => {
    const source = '[first][manual]\n\n[manual';

    expect(text(parse(source))).toBe('first');
    expect(text(parse(source, false))).toBe('[first][manual][manual');
  });

  test.each(['> ', '- ', '> - '])(
    'holds definition prefixes inside a block container without hiding ordinary continuations: %s',
    (container) => {
      const prefix = '[first][manual]\n\n' + container;

      let source = prefix;

      for (const character of '[manual]: https://example.test "Title"') {
        source += character;

        expect({ source, text: text(parse(source)) }).toEqual({ source, text: 'first' });
      }

      expect(parse(source)).toEqual(parse(source, false));

      expect(text(parse(prefix + '[manual] ordinary prose'))).toBe('first[manual] ordinary prose');
    },
  );

  test('does not hold a known shortcut link or an unrelated label', () => {
    const prefix = '[first][manual]\n\n[manual]: /guide\n\n';

    expect(text(parse(prefix + '[manual]'))).toBe('firstmanual');
    expect(text(parse('[first][manual]\n\n[other'))).toBe('firstother');
  });

  test.each([
    ['manual', 'man&#117;al'],
    [String.raw`manual\*`, 'manual*'],
    ['manual*', String.raw`manual\*`],
  ])('does not decode identifiers when matching %s against %s', (reference, definition) => {
    const prefix = '[first][' + reference + ']\n\n';

    expect(text(parse(prefix + '[' + definition + ']'))).not.toBe('first');

    const tree = parse(prefix + '[' + definition + ']: /wrong');

    expect(firstLink(prefix + '[' + definition + ']: /wrong')).toMatchObject({ url: '#' });

    expect(text(tree)).toBe('first');

    expect(parse(prefix + '[' + definition + ']: /wrong', false).children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text' }],
    });
  });

  test.each([
    ['multi line', 'multi\nline'],
    ['multi line', 'multi\r\nline'],
    ['STRASSE', 'straße'],
    ['straße', 'STRASSE'],
    ['σ', 'ς'],
  ])(
    'holds all definition prefixes with native identifier normalization: %s / %s',
    (reference, definition) => {
      const prefix = '[first][' + reference + ']\n\n';

      let source = prefix;

      for (const character of '[' + definition + ']: /guide "Title"') {
        source += character;

        expect({ source, text: text(parse(source)) }).toEqual({ source, text: 'first' });
      }

      expect(parse(source)).toEqual(parse(source, false));
    },
  );

  test.each(['', '> ', '- ', '> - '])(
    'keeps a multiline definition label hidden throughout its container prefixes: %s',
    (container) => {
      const continuation = container.includes('-') ? container.replace('-', ' ') : container;

      let source = '[first][multi line]\n\n' + container;

      for (const character of '[multi\n' + continuation + 'line]: /guide "Title"') {
        source += character;

        expect({ source, text: text(parse(source)) }).toEqual({ source, text: 'first' });
      }

      expect(parse(source)).toEqual(parse(source, false));
    },
  );

  test('preserves whitespace-only reference labels and releases an interrupted multiline label', () => {
    expect(text(parse('[first][ ] and ordinary text'))).toBe('[first][ ] and ordinary text');

    expect(text(parse('[first][ ]\n\n[ ]: /url'))).toBe('[first][ ][ ]: /url');

    const source = '[first][multi line]\n\n[multi\n\nline';

    expect(text(parse(source))).toContain('[multi');
    expect(text(parse(source))).toContain('line');
  });

  test.each(['[other', '[manual] ordinary prose', '[manual](url)', '[manual]\n', '[manual]\nnext'])(
    'releases a definition candidate when the continuation rules it out: %s',
    (suffix) => {
      const prefix = '[first][manual]\n\n';

      expect(text(parse(prefix + suffix))).toBe('first' + text(parse(suffix)));
    },
  );

  test.each(['[label][manual]', '[manual][]', '[**label**][manual]'])(
    'keeps the first label linked throughout reference and delayed definition input: %s',
    (reference) => {
      const source = reference + '\n\n[manual]: https://example.test/manual "Guide title"';
      const firstClose = reference.indexOf(']');

      for (let offset = firstClose + 1; offset <= source.length; offset += 1) {
        expect({
          prefix: source.slice(0, offset),
          hasLink: Boolean(firstLink(source.slice(0, offset))),
        }).toEqual({ prefix: source.slice(0, offset), hasLink: true });
      }

      expect(parse(source)).toEqual(parse(source, false));
    },
  );

  test('does not leak a definition or title while the parser temporarily rejects it', () => {
    const prefix = '[label][manual]\n\n[manual]:';
    const suffix = ' https://example.test/manual "Guide title"';

    for (let offset = 0; offset < suffix.length; offset += 1) {
      const source = prefix + suffix.slice(0, offset);
      const tree = parse(source);

      expect(text(tree)).toBe('label');
    }
  });

  test('preserves several explicit references before a later definition', () => {
    const source =
      '[first][manual] and [manual][].\n\nAnother paragraph.\n\n[manual]: https://example.test "Partial';
    const tree = parse(source);

    expect(text(tree)).toBe('first and manual.Another paragraph.');
    expect(firstLink(source)).toMatchObject({ url: 'https://example.test' });
  });

  test.each([
    String.raw`\[literal][manual]`,
    '`[literal][manual]`',
    '[TODO] ordinary prose',
    '[x][a[b]]',
    '[x][a]\n\n[a]: url plain text',
  ])('preserves literals and invalid reference definitions: %s', (source) => {
    const original = parse(source, false);
    const result = parse(source);

    if (source.startsWith('[x][a]\n')) {
      expect(text(result)).toContain('[a]: url plain text');
    } else {
      expect(result).toEqual(original);
    }
  });

  test('does not turn an image reference into a link', () => {
    const source = '![alt][manual]';

    expect(firstLink(source)).toBeUndefined();
    expect(text(parse(source, false))).toBe(source);
  });

  test('restores unresolved references when ending mode stops', () => {
    const source = '[label][missing]\n\nThe definition never arrived.';

    expect(text(parse(source))).toBe('labelThe definition never arrived.');
    expect(text(parse(source, false))).toBe('[label][missing]The definition never arrived.');
  });

  test('does not use positions or guess absent source', () => {
    const source = '[label][missing]';
    const original = parse(source, false);

    expect(runRepairs(stripPositions(original), new IncompleteLinkRepairPlugin())).toEqual(
      stripPositions(parse(source)),
    );

    const unknown = root([paragraph([{ type: 'text', value: source }])]);

    expect(runRepairs(unknown, new IncompleteLinkRepairPlugin())).toEqual(unknown);
  });
});

const freeze = (node: Parent | RootContent): void => {
  if ('children' in node) {
    node.children.forEach(freeze);
    Object.freeze(node.children);
  }

  Object.freeze(node.data);
  Object.freeze(node);
};

test('reference helper does not mutate its input or trust stale text provenance', () => {
  const tree = parse('[label][missing]', false);
  const snapshot = structuredClone(tree);

  freeze(tree);

  expect(getPendingReferenceTree(tree)?.[0]).toMatchObject({ children: [{ type: 'link' }] });
  expect(tree).toEqual(snapshot);

  const stale = root([
    paragraph([{ type: 'text', value: 'changed content', data: { source: '[label][missing]' } }]),
  ]);

  expect(getPendingReferenceTree(stale)).toBeUndefined();
});

test.each([
  '[label $x]$][missing]',
  '[label $x[$][missing]',
  '[label $x]$](url',
  '[label **$x[$**](url',
])('treats brackets in parsed math as opaque while matching the outer link: %s', (source) => {
  const tree = parseMarkdown(source, [
    new SyntaxMathRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({ plugins: [new IncompleteLinkRepairPlugin()], ending: true }),
  ]);
  const container = tree.children[0];

  expect(container).toMatchObject({ type: 'paragraph', children: [{ type: 'link' }] });
  expect(text(tree)).toBe(source.includes('x]') ? 'label x]' : 'label x[');
});
