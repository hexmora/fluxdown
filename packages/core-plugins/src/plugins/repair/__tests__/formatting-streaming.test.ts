import type { Parent, PhrasingContent, RootContent } from 'mdast';

import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough';
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough';

import { captureRepairSource } from '../../remark/utils';
import { IncompleteEmphasisRepairPlugin } from '../incomplete-emphasis';
import { IncompleteInlineCodeRepairPlugin } from '../incomplete-inline-code';
import { IncompleteStrikethroughRepairPlugin } from '../incomplete-strikethrough';
import { IncompleteStrongRepairPlugin } from '../incomplete-strong';
import { getIncompleteDelimiterChildren } from '../utils';
import { runRepairs } from './utils';

const plugins = [
  new IncompleteInlineCodeRepairPlugin(),
  new IncompleteStrongRepairPlugin(),
  new IncompleteEmphasisRepairPlugin(),
  new IncompleteStrikethroughRepairPlugin(),
];

const parse = (source: string) => {
  return captureRepairSource(
    fromMarkdown(source, {
      extensions: [gfmStrikethrough()],
      mdastExtensions: [gfmStrikethroughFromMarkdown()],
    }),
    source,
  );
};

const text = (node: Parent | RootContent): string => {
  return 'value' in node ? node.value : 'children' in node ? node.children.map(text).join('') : '';
};

const compact = (value: string) => value.replace(/\s/g, '');

describe('streamed inline formatting', () => {
  test.each(['*', '_', '**', '__', '***', '___', '~', '~~'])(
    'keeps visible content through every prefix of %s formatting',
    (marker) => {
      for (const body of ['alpha beta', '中文内容测试', 'café naïve']) {
        const prefix = 'Before ';

        const source = prefix + marker + body + marker + ' after';

        for (let offset = 1; offset <= source.length; offset += 1) {
          const bodyEnd = prefix.length + marker.length + body.length;

          const expected =
            prefix.slice(0, offset) +
            body.slice(0, Math.max(0, Math.min(offset, bodyEnd) - prefix.length - marker.length)) +
            ' after'.slice(0, Math.max(0, offset - bodyEnd - marker.length));

          const result = runRepairs(parse(source.slice(0, offset)), plugins);

          expect({ source: source.slice(0, offset), text: compact(text(result)) }).toEqual({
            source: source.slice(0, offset),
            text: compact(expected),
          });
        }
      }
    },
  );

  test.each([
    ['**bold *中文* bold**', 'bold 中文 bold'],
    ['*italic **bold** italic*', 'italic bold italic'],
    ['~~deleted **bold** text~~', 'deleted bold text'],
    ['**bold ~~deleted~~ text**', 'bold deleted text'],
    ['***bold italic***', 'bold italic'],
    ['___bold italic___', 'bold italic'],
  ])('repairs nested formatting without exposing its markers: %s', (source, expected) => {
    for (let offset = 1; offset <= source.length; offset += 1) {
      const prefix = source.slice(0, offset);

      const result = runRepairs(parse('Before ' + prefix), plugins);

      expect(compact(text(result))).toBe(compact('Before ' + prefix.replace(/[*_~]/g, '')));
    }

    expect(compact(text(runRepairs(parse(source), plugins)))).toBe(compact(expected));
  });

  test.each([
    String.raw`\***literal`,
    String.raw`\~~literal`,
    '&#42;&#42;literal',
    '&#126;&#126;literal',
    'value__identifier',
    '中文__标识符',
    'word***!',
    'word~~!',
    'a * b',
    'a ~~ b',
    'Before ~~~literal',
    'word**`code`',
    'word*`code`',
    'word~~`code`',
    'word**<span>',
  ])('preserves escaped, intraword, and invalid delimiters: %s', (source) => {
    const tree = parse(source);

    expect(runRepairs(tree, plugins)).toEqual(tree);
  });

  test.each(['**unfinished', '*unfinished', '~~unfinished', 'left ***'])(
    'restores unresolved literal text when ending repairs are disabled: %s',
    (source) => {
      const tree = parse(source);

      expect(runRepairs(tree, plugins, { ending: false })).toEqual(tree);
    },
  );

  test('skips source-less text and preserves completed code punctuation', () => {
    const tree = parse('before `**code** ~~literal~~`');

    expect(runRepairs(tree, plugins)).toEqual(tree);

    expect(
      runRepairs({ type: 'paragraph', children: [{ type: 'text', value: '**literal' }] }, plugins),
    ).toEqual({ type: 'paragraph', children: [{ type: 'text', value: '**literal' }] });
  });

  test('builds composed repairs without mutating the original text or its source', () => {
    const children: PhrasingContent[] = [
      {
        type: 'text',
        value: '**bold *italic',
        data: { source: '**bold *italic' },
      },
    ];

    Object.freeze(children[0]?.data);

    Object.freeze(children[0]);

    Object.freeze(children);

    const repaired = getIncompleteDelimiterChildren(children, 'strong');

    expect(repaired).toMatchObject([
      {
        type: 'strong',
        children: [{ type: 'text', value: 'bold *italic', data: { source: 'bold *italic' } }],
      },
    ]);

    expect(children).toEqual([
      { type: 'text', value: '**bold *italic', data: { source: '**bold *italic' } },
    ]);
  });

  test.each([
    ['&amp; **bold &amp;', '& bold &'],
    [String.raw`\* literal **bold \*`, '* literal bold *'],
    ['&amp; ___italic bold &amp;', '& italic bold &'],
    ['&amp; ~~deleted &amp;', '& deleted &'],
  ])('maps delimiters between decoded prefixes and suffixes: %s', (source, expected) => {
    expect(text(runRepairs(parse(source), plugins))).toBe(expected);
  });

  test.each([
    '*foo**bar*',
    '**bold ~literal**',
    '~~deleted *literal~~',
    '[foo*bar](url)',
    '[中文**字面量](url)',
    '[**bold *literal**](url)',
    '[foo*bar][target]\n\n[target]: /url',
  ])('does not repair literal delimiters inside a completed inline container: %s', (source) => {
    const tree = parse(source);

    expect(runRepairs(tree, plugins)).toEqual(tree);
  });
});
