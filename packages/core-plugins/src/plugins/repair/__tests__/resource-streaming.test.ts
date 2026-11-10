import type { IRepairPlugin } from '@fluxdown/types';
import type { Parent, RootContent, Text } from 'mdast';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { getRawTextOffset, sliceRepairText } from '../../../utils';
import { parseMarkdown, stripPositions } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxAutolinkRemarkPlugin } from '../../remark/syntax-autolink';
import { SyntaxStrikethroughRemarkPlugin } from '../../remark/syntax-strikethrough';
import { IncompleteImageRepairPlugin } from '../incomplete-image';
import { IncompleteLinkRepairPlugin } from '../incomplete-link';
import { getIncompleteResource } from '../utils';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

const resources = [new IncompleteLinkRepairPlugin(), new IncompleteImageRepairPlugin()];

const parse = (
  source: string,
  plugins: IRepairPlugin[] = PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin()),
  ending = true,
) => {
  return parseMarkdown(source, [
    new SyntaxAutolinkRemarkPlugin(),
    new SyntaxStrikethroughRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({ plugins, ending, safe: false }),
  ]);
};

const text = (node: Parent | RootContent): string => {
  return node.type === 'image' && 'alt' in node
    ? (node.alt ?? '')
    : 'value' in node
      ? node.value
      : 'children' in node
        ? node.children.map(text).join('')
        : '';
};

const compact = (value: string) => value.replace(/\s/g, '');

const destinations = [
  'https://example.test/path',
  '/local/path',
  'https://example.test/a_(b)',
  '<https://example.test/a_(b)>',
  'https://example.test "Title"',
  "https://example.test 'Title'",
  'https://example.test (Title)',
  '<> "Title spaces"',
  'https://example.test/a\\(b\\) "A \\"title\\""',
];

describe('streamed links and images', () => {
  test.each(destinations)(
    'keeps only the label throughout destination prefixes: %s',
    (destination) => {
      for (const body of ['alpha beta', '中文内容测试', 'café naïve']) {
        for (const marker of ['[', '![']) {
          const source = marker + body + '](' + destination + ') after';

          const labelEnd = marker.length + body.length;

          const resourceEnd = labelEnd + 2 + destination.length + 1;

          for (let offset = 1; offset <= source.length; offset += 1) {
            const partial = source.slice(0, offset);

            const label = body.slice(0, Math.max(0, Math.min(offset, labelEnd) - marker.length));

            const placeholder = marker === '![' && offset === 2 ? 'image' : '';

            const expected =
              label + placeholder + ' after'.slice(0, Math.max(0, offset - resourceEnd));

            expect({ partial, actual: compact(text(parse(partial))) }).toEqual({
              partial,
              actual: compact(expected),
            });
          }
        }
      }
    },
  );

  test.each(['**', '*', '***', '_', '__', '~~', '`'])(
    'preserves label formatting across AST nodes and all prefixes: %s',
    (marker) => {
      const source =
        'Before [' + marker + 'label' + marker + '](https://example.test/a_(b) "Title") after';

      const bodyStart = 'Before ['.length + marker.length;

      const bodyEnd = bodyStart + 'label'.length;

      const suffixStart = source.indexOf(' after');

      for (let offset = 1; offset <= source.length; offset += 1) {
        const partial = source.slice(0, offset);

        const expected =
          'Before '.slice(0, offset) +
          'label'.slice(0, Math.max(0, Math.min(offset, bodyEnd) - bodyStart)) +
          ' after'.slice(0, Math.max(0, offset - suffixStart));

        expect({ partial, actual: compact(text(parse(partial))) }).toEqual({
          partial,
          actual: compact(expected),
        });
      }
    },
  );

  test.each(['> line\n> ', '- line\n  ', '## '])(
    'handles a link in its container without positions: %s',
    (prefix) => {
      const source = prefix + '[**label**](https://example.test "title")';

      for (let offset = prefix.length + 1; offset <= source.length; offset += 1) {
        const partial = source.slice(0, offset);

        const original = parse(partial, [], false);

        const expected = parse(partial);

        expect(
          runRepairs(
            stripPositions(original),
            PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin()),
          ),
        ).toEqual(stripPositions(expected));
      }
    },
  );

  test.each([
    '[label] ordinary text',
    '[label](url plain',
    '[label](url\\ plain',
    '[label](<url\\\nnext',
    '[label](a_(b c',
    '[label](<url\nnext',
    '[label](<url>tail',
    '[label](url "title" extra',
    '[label](url (nested(',
    '![label] ordinary text',
    '![label](url plain',
    'Hello!',
    '! ordinary text',
    String.raw`\![literal`,
    String.raw`!\[literal`,
    String.raw`\[literal`,
    '&#91;literal',
    '&#33;&#91;literal',
    '!&#91;literal',
    '`[literal](url`',
    '[outer [inner](url)',
    '[outer **[inner](url)**',
  ])('restores ordinary or invalid continuation and preserves escaped syntax: %s', (source) => {
    const original = parse(source, [], false);

    expect(parse(source, resources)).toEqual(original);
  });

  test.each(['[label', '[label](url "title', '![alt', '![alt](url', '!'])(
    'restores the original AST when ending repairs are disabled: %s',
    (source) => {
      expect(parse(source, resources, false)).toEqual(parse(source, [], false));
    },
  );

  test.each([
    '[label](https://example.test/a_(b) "Title")',
    '[**bold** and `code`](https://example.test)',
    '[label](<https://example.test/a_(b)>)',
    '![**bold** and `code`](https://example.test)',
    '[nested [brackets] label](url)',
    '[label](url "title") after',
    '*literal [brackets*',
    '**literal ![image**',
    '[literal ![image](url)](outer)',
    '![**literal](url)',
  ])('leaves completed resources and surrounding content unchanged: %s', (source) => {
    expect(parse(source, resources)).toEqual(parse(source, [], false));
  });

  test('keeps unresolved image formatting literal and restores it at stream completion', () => {
    expect(text(parse('![**literal', resources))).toBe('**literal');

    expect(parse('![**literal', resources, false)).toEqual(parse('![**literal', [], false));

    expect(parse('![**literal](url)')).toEqual(parse('![**literal](url)', [], false));
  });

  test('preserves semantic children and exact escaped label text', () => {
    const tree = parse(
      String.raw`before [**bold** and \*literal\* &amp; ` + '`code`](https://example.test',
      resources,
    );

    const container = tree.children[0];

    expect(container).toMatchObject({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'before ' },
        {
          type: 'link',
          url: '#',
          children: [
            { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
            { type: 'text', value: ' and *literal* & ' },
            { type: 'inlineCode', value: 'code' },
          ],
        },
      ],
    });
  });

  test('keeps brackets inside code opaque and supports nested image labels', () => {
    expect(text(parse('[label `[code]`](url'))).toBe('label [code]');

    expect(text(parse('![outer [inner'))).toBe('outer [inner');

    expect(text(parse('![**bold** and `code`](url', resources))).toBe('bold and code');
  });

  test.each(['[', ']'])(
    'ignores code brackets nested inside formatting while pairing labels: %s',
    (bracket) => {
      for (const marker of ['[', '![']) {
        const source = marker + '**`' + bracket + '`** label](https://example.test';

        expect(text(parse(source, resources))).toBe(bracket + ' label');

        expect(parse(source + ')', resources)).toEqual(parse(source + ')', [], false));
      }
    },
  );

  test('rejects stale nested source instead of interpreting opaque code punctuation', () => {
    const tree = repairMarkdown('[**`[`** label](url', []);

    const container = tree.children[0];

    if (container?.type !== 'paragraph' || container.children[1]?.type !== 'strong') {
      throw new Error('Expected a formatted label');
    }

    delete container.children[1].children[0]?.data?.source;

    expect(runRepairs(tree, resources)).toEqual(tree);
  });

  test('can discard the whole multi-node image suffix without losing earlier content', () => {
    const tree = parse('**before** ![**bold** and `code`](https://example.test', [
      new IncompleteImageRepairPlugin({ strategy: 'discard' }),
    ]);

    expect(text(tree)).toBe('before ');

    expect(tree.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'strong' }, { type: 'text', value: ' ' }],
    });
  });

  test('does not infer a marker from absent source', () => {
    for (const value of ['[label', '![alt']) {
      const tree = root([paragraph([{ type: 'text', value }])]);

      expect(runRepairs(tree, resources)).toEqual(tree);
    }
  });

  test('scans deeply nested invalid labels without changing their meaning', () => {
    const source = '['.repeat(4000) + 'literal' + ']'.repeat(4000) + ' ordinary text';

    expect(repairMarkdown(source, resources)).toEqual(repairMarkdown(source, []));
  });

  test('pure resource extraction preserves frozen input nodes', () => {
    const label = Object.freeze({
      type: 'text' as const,
      value: '[label](url',
      data: Object.freeze({ source: '[label](url' }),
    });

    const node = paragraph([label]);

    Object.freeze(node.children);

    Object.freeze(node);

    expect(getIncompleteResource(node, false)).toMatchObject({
      prefix: [],
      label: [{ type: 'text', value: 'label', data: { source: 'label' } }],
    });

    expect(label.value).toBe('[label](url');
  });
});

describe('exact text provenance slicing', () => {
  test.each([
    [String.raw`\*a&amp;b`, 0, 0],
    [String.raw`\*a&amp;b`, 1, 2],
    [String.raw`\*a&amp;b`, 3, 8],
    ['&#x1F600;tail', 1, undefined],
    ['&#x1F600;tail', 2, 9],
  ])('maps decoded offsets without splitting an entity: %s at %s', (source, offset, expected) => {
    expect(getRawTextOffset(String(source), Number(offset))).toBe(expected);
  });

  test('preserves exact entity and escape slices without mutating frozen input', () => {
    const node: Text = Object.freeze({
      type: 'text',
      value: '*a&b',
      data: Object.freeze({ source: String.raw`\*a&amp;b` }),
    });

    expect(sliceRepairText(node, 1, 3)).toEqual({
      type: 'text',
      value: 'a&',
      data: { source: 'a&amp;' },
    });

    expect(node.data?.source).toBe(String.raw`\*a&amp;b`);

    expect(sliceRepairText({ type: 'text', value: 'unknown' }, 0)).toBeUndefined();
  });

  test('retains a reliable quoted suffix while dropping provenance for normalized container prefixes', () => {
    const node: Text = {
      type: 'text',
      value: 'first\n**bold',
      data: { source: 'first\n> **bold' },
    };

    expect(sliceRepairText(node, 8)).toEqual({
      type: 'text',
      value: 'bold',
      data: { source: 'bold' },
    });

    expect(sliceRepairText(node, 0, 8)).toEqual({ type: 'text', value: 'first\n**' });
  });
});
