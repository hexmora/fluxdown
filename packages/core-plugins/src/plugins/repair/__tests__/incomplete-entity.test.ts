import type { Parent, RootContent } from 'mdast';

import { characterEntities } from 'character-entities';
import { decodeString } from 'micromark-util-decode-string';

import { IncompleteEntityRepairPlugin } from '../incomplete-entity';
import { getIncompleteEntityCutoff } from '../incomplete-entity/utils';
import { paragraph, repairMarkdown, root, runRepairs } from './utils';

const getText = (node: Parent | RootContent): string => {
  return 'children' in node
    ? node.children.map(getText).join('')
    : 'value' in node
      ? node.value
      : '';
};

describe('IncompleteEntityRepairPlugin', () => {
  test('holds every valid named entity prefix without mutating helper inputs', () => {
    for (const name of Object.keys(characterEntities)) {
      for (let length = 0; length <= name.length; length += 1) {
        const source = `prefix &${name.slice(0, length)}`;

        const node = { type: 'text' as const, value: source, data: { source } };

        expect(getIncompleteEntityCutoff(node)).toBe(7);

        expect(node).toEqual({ type: 'text', value: source, data: { source } });
      }
    }
  });

  test.each(['&amp;', '&lt;', '&NotEqualTilde;', '&#128512;', '&#x1f600;', '&#X26;'])(
    'holds the unfinished reference and releases its decoded value for %j',
    (entity) => {
      for (let length = 1; length < entity.length; length += 1) {
        expect(
          getText(
            repairMarkdown(`before ${entity.slice(0, length)}`, new IncompleteEntityRepairPlugin()),
          ),
        ).toBe('before ');
      }

      expect(getText(repairMarkdown(`before ${entity}`, new IncompleteEntityRepairPlugin()))).toBe(
        `before ${decodeString(entity)}`,
      );
    },
  );

  test.each([
    'AT&T',
    'R&D',
    'A & B',
    '&unknown',
    '&Amp',
    '&#12345678',
    '&#x1234567',
    '&#xyz',
    '&& impossible',
  ])('releases a suffix as soon as it cannot become an entity: %j', (source) => {
    expect(getText(repairMarkdown(source, new IncompleteEntityRepairPlugin()))).toBe(source);
  });

  test.each([String.raw`\&amp`, '&#38;amp', '&amp;amp', '&amp; &lt;', String.raw`\&#12`])(
    'keeps escaped and already-decoded ampersands literal: %j',
    (source) => {
      expect(getText(repairMarkdown(source, new IncompleteEntityRepairPlugin()))).toBe(
        decodeString(source),
      );
    },
  );

  test('skips source-less text, earlier leaves, and code', () => {
    const tree = root([
      paragraph([
        { type: 'text', value: '&amp', data: { source: '&amp' } },
        { type: 'inlineCode', value: '&amp' },
        { type: 'text', value: '&amp' },
      ]),
    ]);

    expect(runRepairs(tree, new IncompleteEntityRepairPlugin())).toEqual(tree);

    expect(getText(repairMarkdown('`&amp`', new IncompleteEntityRepairPlugin()))).toBe('&amp');

    expect(getText(repairMarkdown('```\n&amp', new IncompleteEntityRepairPlugin()))).toBe('&amp');
  });

  test.each(['*x &am*', '**x &am**', '[x &am](https://example.test)', 'AT&', 'caf&eacute'])(
    'preserves ambiguous literals inside completed syntax or words: %j',
    (source) => {
      expect(repairMarkdown(source, new IncompleteEntityRepairPlugin())).toEqual(
        repairMarkdown(source, new IncompleteEntityRepairPlugin(), { ending: false }),
      );
    },
  );

  test('invalidates consumed provenance and restores unfinished literal text when streaming ends', () => {
    const source = '> tail &amp';

    const repaired = repairMarkdown(source, new IncompleteEntityRepairPlugin());

    expect(getText(repaired)).toBe('tail ');

    expect(repaired.data?.source).toBeUndefined();

    expect(
      getText(repairMarkdown(source, new IncompleteEntityRepairPlugin(), { ending: false })),
    ).toBe('tail &amp');
  });
});
