import type { Root, RootContent } from 'mdast';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { parseMarkdown, stripPositions, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxPolicyRemarkPlugin } from '../../remark/syntax-policy';
import { IncompleteListMarkerRepairPlugin } from '../incomplete-list-marker';
import { runRepairs } from './utils';

const parse = (source: string, ending = true, preset = false) =>
  parseMarkdown(source, [
    new SyntaxPolicyRemarkPlugin({ indentedCode: true, setextHeading: true }),
    new ApplyRepairsRemarkPlugin({
      plugins: preset
        ? PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin())
        : [new IncompleteListMarkerRepairPlugin()],
      ending,
    }),
  ]);

const firstBlock = (tree: Root): RootContent | undefined => {
  let result: RootContent | undefined;

  walkMdast(tree, (node) => {
    if (node.type === 'listItem' && result === undefined) {
      result = node.children[0];
    }
  });

  return result;
};

test.each(['', '> ', '> > '])(
  'keeps parent text as a paragraph throughout nested-list input: %s',
  (quote) => {
    const source = quote + '- parent\n' + quote + '  - alpha beta';

    for (let end = (quote + '- parent').length; end <= source.length; end += 1) {
      const prefix = source.slice(0, end);

      expect({ prefix, type: firstBlock(parse(prefix, true, true))?.type }).toEqual({
        prefix,
        type: 'paragraph',
      });
    }
  },
);

test.each([
  '**parent🚀',
  '*parent🚀',
  '~~parent🚀',
  '[parent🚀',
  '![parent🚀',
  '`parent🚀',
  'parent🚀 <span title="open',
])('resolves the list structure before repairing inline content: %s', (content) => {
  for (const quote of ['', '> ', '> > ']) {
    const parent = quote + '- ' + content;

    let prefix = parent;

    for (const character of '\n' + quote + '  - child🚀') {
      prefix += character;

      expect({ prefix, type: firstBlock(parse(prefix, true, true))?.type }).toEqual({
        prefix,
        type: 'paragraph',
      });
    }

    for (const marker of ['-', '--', '---', '-------------', '--- \t']) {
      const source = parent + '\n' + quote + '  ' + marker;

      expect(firstBlock(parse(source, true, true))?.type).toBe('paragraph');

      expect(firstBlock(parse(source, false, true))).toMatchObject({
        type: 'heading',
        depth: 2,
      });

      expect(firstBlock(parse(source + '\n', true, true))).toMatchObject({
        type: 'heading',
        depth: 2,
      });
    }
  }
});

test.each([
  '- **parent**\n  ---\n',
  '- **parent**\n  ---\n  following',
  '> - **parent**\n>   ---\n',
  '> > - **parent**\n> >   ---\n',
  '- **parent**\n  ===',
  '**parent**\n---',
  '> **parent**\n> ---',
  '- `parent\n  -`',
  '- ```\n  parent\n  -',
  '- item\n\n      parent\n      -',
  '- **parent**\n  \\-',
  '- **parent**\n  &#45;',
  '> - **parent**\n\n---',
])('keeps native completed structures under the full preset: %j', (source) => {
  expect(parse(source, true, true)).toEqual(parse(source, false, true));
});

test.each(['-', '--', '---', '----------------', '- ', '--\t', '---   '])(
  'defers only the unconfirmed final dash underline: %j',
  (marker) => {
    const source = '- **parent**\n  ' + marker;

    expect(firstBlock(parse(source))).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'strong' }],
    });
    expect(firstBlock(parse(source, false))).toMatchObject({ type: 'heading', depth: 2 });
    expect(parse(source + '\n')).toEqual(parse(source + '\n', false));
  },
);

test.each([
  '- parent\n  ---\n',
  '- parent\n  ---\n  following',
  '- parent\n  ---\n\nnext',
  '- # parent',
  '- parent\n  ===',
  'parent\n---',
  '> parent\n> ---',
  '- `parent\n  -`',
  '- ```\n  parent\n  -',
  '- item\n\n      parent\n      -',
  '- parent\n  \\-',
  '- parent\n  &#45;',
  '> - parent\n>   ---\n',
  '> > - parent\n> >   ---\n',
  '> - parent\n\n---',
])('preserves confirmed headings, literal markers, and code: %j', (source) => {
  expect(parse(source)).toEqual(parse(source, false));
});

test('does not depend on positions and does not guess missing or stale source', () => {
  const source = '- parent\n  -';
  const original = parse(source, false);
  const withoutPositions = stripPositions(original);

  expect(runRepairs(withoutPositions, new IncompleteListMarkerRepairPlugin())).toEqual(
    stripPositions(parse(source)),
  );

  for (const type of ['root', 'listItem', 'heading', 'text']) {
    const missing = structuredClone(original);

    walkMdast(missing, (node) => {
      if (node.type === type) {
        delete node.data?.source;
      }
    });

    expect(runRepairs(missing, new IncompleteListMarkerRepairPlugin())).toEqual(missing);
  }

  const stale = structuredClone(original);

  walkMdast(stale, (node) => {
    if (node.type === 'text') {
      node.value = 'changed';
    }
  });

  expect(runRepairs(stale, new IncompleteListMarkerRepairPlugin())).toEqual(stale);
});
