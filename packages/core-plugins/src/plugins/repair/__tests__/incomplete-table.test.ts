import type { IRepairPlugin } from '@fluxdown/types';
import type { Paragraph, Root } from 'mdast';
import type { Plugin } from 'unified';

import { PluginPriority } from '@fluxdown/types';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import {
  collectTextValues,
  getAstProcessorByPlugins,
  parseMarkdown,
  stripPositions,
  walkMdast,
} from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxPolicyRemarkPlugin } from '../../remark/syntax-policy';
import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { IncompleteTableRepairPlugin } from '../incomplete-table';
import { getIncompleteTableParagraph } from '../incomplete-table/utils';
import { paragraph as createParagraph, root, runRepairs } from './utils';

const parse = (
  source: string,
  ending = true,
  plugins: IRepairPlugin[] = [new IncompleteTableRepairPlugin()],
) =>
  parseMarkdown(source, [
    new SyntaxTableRemarkPlugin(),
    new SyntaxPolicyRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({ plugins, ending, safe: false }),
  ]);

const text = (source: string) => collectTextValues(parse(source)).join('');

describe('IncompleteTableRepairPlugin', () => {
  test('is an ending-only repair that runs before inline repairs', () => {
    expect(IncompleteTableRepairPlugin.key).toBe('repair-incomplete-table');
    expect(new IncompleteTableRepairPlugin().config).toEqual({
      scope: 'tail',
      ending: true,
      priority: PluginPriority.Highest,
    });
  });

  test.each(['', '> ', '- ', '> - ', '- > '])(
    'holds each header and delimiter prefix in %j',
    (prefix) => {
      const header = '| **Name** | `Value` |';
      const continuation = prefix.replace(/-/g, ' ');
      const delimiter = '| :--- | ---: |';
      const repairs = PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin());

      for (let length = 1; length <= header.length; length += 1) {
        const tree = parse(prefix + header.slice(0, length), true, repairs);
        expect(collectTextValues(tree)).toEqual([]);
      }

      for (let length = 0; length < delimiter.length; length += 1) {
        const tree = parse(
          `${prefix}${header}\n${continuation}${delimiter.slice(0, length)}`,
          true,
          repairs,
        );
        const values = collectTextValues(tree);
        expect(values.every((value) => !value.includes('|') && !value.includes('---'))).toBe(true);
      }

      expect(
        collectTextValues(parse(`${prefix}${header}\n${continuation}${delimiter}`, true, repairs)),
      ).toEqual(['Name']);
    },
  );

  test.each(['> ', '>> ', '> > ', '- > ', '> - '])(
    'holds every source prefix, including container markers, in %j',
    (prefix) => {
      const continuation = prefix.replace(/-/g, ' ');
      const source = `${prefix}| A | B |\n${continuation}| :--- | ---: |`;

      for (let length = prefix.length + 1; length <= source.length; length += 1) {
        const tree = parse(source.slice(0, length));
        expect(collectTextValues(tree).every((value) => !value.includes('|'))).toBe(true);
      }
    },
  );

  test('keeps prose before a hard break at the candidate boundary', () => {
    expect(text('Before  \n| A | B |')).toBe('Before');
  });

  test.each(['\n', '\r\n', '\r'])(
    'keeps preceding prose and inline formatting with %j newlines',
    (newline) => {
      const tree = parse(`Before **bold** &amp; after${newline}| A | B |${newline}| -`);

      expect(stripPositions(tree.children)).toEqual([
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'Before ', data: { source: 'Before ' } },
            {
              type: 'strong',
              data: { source: '**bold**' },
              children: [{ type: 'text', value: 'bold', data: { source: 'bold' } }],
            },
            { type: 'text', value: ' & after' },
          ],
        },
      ]);
    },
  );

  test.each(['-', '--', '---', '-- |', '-- | :', '|', ':'])(
    'holds optional-outer-pipe tables after delimiter evidence %j',
    (delimiter) => {
      expect(text(`Name | Value\n${delimiter}`)).toBe('');
    },
  );

  test.each([
    'one | another',
    'a || b',
    String.raw`\| literal`,
    '&#124; literal',
    '`| literal`',
    'text `a|b`',
    'text `a|b`\n--',
    '| A | B |\nordinary prose',
    '| A | B |\n| invalid | separator |',
    '| A | B |\n| - x',
    '| A | B |\n| - | - | -',
    '| A | B |\n| : |',
    '| A | B |\n| -\n',
    '| A | B |\n\n',
    '> | A | B |\n>\n>',
    '```md\n| A | B |',
  ])('preserves resolved prose or literal pipes in %j', (source) => {
    expect(parse(source)).toEqual(parse(source, false));
  });

  test('ignores pipes inside a multiline inline code span', () => {
    const source = '`code\n| literal`';
    expect(parse(source)).toEqual(parse(source, false));
  });

  test.each(['&NewLine;', '&#10;', '&#xA;'])(
    'preserves decoded newline entities in preceding prose: %s',
    (entity) => {
      for (const prefix of ['', '> ', '- ', '> - ']) {
        const continuation = prefix.replace(/-/g, ' ');
        expect(
          text(`${prefix}first\n${continuation}normal ${entity} suffix\n${continuation}| A | B |`),
        ).toBe('first\nnormal \n suffix');
      }
    },
  );

  test('restores the header once a single dash plus whitespace becomes a list', () => {
    expect(collectTextValues(parse('Name | Value\n- | -'))[0]).toBe('Name | Value');
  });

  test('keeps preceding blocks and only hides the active table candidate', () => {
    const source = '| previous paragraph\n\nDone.\n\n| pending';
    expect(collectTextValues(parse(source))).toEqual(['| previous paragraph', 'Done.']);
  });

  test('restores content when ending repairs stop and leaves complete tables intact', () => {
    expect(collectTextValues(parse('| A | B |', false))).toEqual(['| A | B |']);
    const source = '| A | B |\n| - | - |\n| one | two |';
    expect(parse(source)).toEqual(parse(source, false));
    expect(parse(source).children[0]?.type).toBe('table');
  });

  test('repairs solely from node sources after all positions are removed', () => {
    const source = '> Before **bold** &amp; after\n> | A | B |\n> | -';
    const processor = getAstProcessorByPlugins({
      remarks: [
        new SyntaxTableRemarkPlugin(),
        new SyntaxPolicyRemarkPlugin(),
        new ApplyRepairsRemarkPlugin({
          plugins: [new IncompleteTableRepairPlugin()],
          ending: true,
        }),
      ],
    });
    const tree = processor.parse(source) as Root;

    walkMdast(tree, (node) => {
      delete node.position;
    });

    expect(collectTextValues(processor.runSync(tree) as Root)).toEqual([
      'Before ',
      'bold',
      ' & after',
    ]);

    expect(tree.data?.source).toBeUndefined();
  });

  test.each(['replace', 'mutate', 'remove', 'nested'] as const)(
    'skips source-dependent repair after a preceding transformer changes children: %s',
    (change) => {
      const transform: Plugin<[], Root> = () => (tree) => {
        const paragraph = tree.children[0] as Paragraph;

        if (change === 'replace') {
          paragraph.children = [{ type: 'text', value: '| generated' }];
        } else if (change === 'mutate') {
          const first = paragraph.children[0];

          if (first?.type === 'text') {
            first.value = '| changed';
          }
        } else if (change === 'remove') {
          paragraph.children.shift();
        } else {
          const strong = paragraph.children[1];

          if (strong?.type === 'strong') {
            strong.children = [{ type: 'text', value: 'generated' }];
          }
        }
      };
      const source = '| **bold**';
      const processor = unified()
        .use(remarkParse)
        .use(transform)
        .use(
          new ApplyRepairsRemarkPlugin({
            plugins: [new IncompleteTableRepairPlugin()],
            ending: true,
          }).plugin,
        );
      const tree = processor.runSync(processor.parse(source), source);

      expect(collectTextValues(tree)).toEqual(
        change === 'replace'
          ? ['| generated']
          : change === 'mutate'
            ? ['| changed', 'bold']
            : change === 'remove'
              ? ['bold']
              : ['| ', 'generated'],
      );
    },
  );

  test('preserves input nodes while producing a source-free table truncation', () => {
    const source = 'before\n| A | B |';
    const processor = getAstProcessorByPlugins({
      remarks: [new ApplyRepairsRemarkPlugin({ plugins: [], ending: true })],
    });
    const tree = processor.parse(source) as Root;
    const paragraph = tree.children[0] as Paragraph;
    const child = paragraph.children[0];
    const result = getIncompleteTableParagraph(paragraph, tree, []);

    expect(child).toMatchObject({ value: source, data: { source } });

    expect(paragraph.data?.source).toBe(source);

    expect(result).toMatchObject({ children: [{ type: 'text', value: 'before' }] });

    expect(result?.data?.source).toBeUndefined();
  });

  test('does not match an earlier header against duplicate source inside a later code block', () => {
    const source = '| A | B |\n\n```\n| A | B |';

    expect(parse(source)).toEqual(parse(source, false));
  });

  test.each(['- ', '> '])(
    'preserves an earlier header when a later %j container repeats it',
    (prefix) => {
      const source = `| A | B |\n\n${prefix}| A | B |`;

      expect(collectTextValues(parse(source))).toEqual(['| A | B |']);

      expect(parse(source).children[0]?.type).toBe('paragraph');
    },
  );

  test('does not guess at unpositioned or source-less ASTs', () => {
    const tree = root([createParagraph([{ type: 'text', value: '| A | B |' }])]);
    expect(runRepairs(tree, new IncompleteTableRepairPlugin())).toEqual(tree);
  });
});

const parseSetext = (source: string, ending = true) =>
  parseMarkdown(source, [
    new SyntaxTableRemarkPlugin(),
    new SyntaxPolicyRemarkPlugin({ setextHeading: true }),
    new ApplyRepairsRemarkPlugin({
      plugins: [new IncompleteTableRepairPlugin()],
      ending,
      safe: false,
    }),
  ]);

describe('Setext ambiguity while a table delimiter arrives', () => {
  test.each(['', '> ', '>> '])(
    'keeps a no-leading-pipe header hidden through the dash run: %s',
    (prefix) => {
      const header = prefix + 'Name | Value\n' + prefix;

      for (const delimiter of ['-', '--', '---', '----', '--- ', '--- |', '--- | -']) {
        expect({
          delimiter,
          text: collectTextValues(parseSetext(header + delimiter)).join(''),
        }).toEqual({
          delimiter,
          text: delimiter === '--- | -' ? 'NameValue' : '',
        });
      }
    },
  );

  test.each([
    'Name | Value\n---\n',
    'Name | Value\n---\nparagraph',
    'Heading\n---',
    '# Name | Value\n---',
    String.raw`Name \| Value` + '\n---',
    'Name &#124; Value\n---',
    '`Name | Value`\n---',
  ])('preserves confirmed headings and literal pipes: %s', (source) => {
    expect(parseSetext(source)).toEqual(parseSetext(source, false));
  });

  test('restores the Setext heading when ending mode stops', () => {
    const source = 'Name | Value\n---';

    expect(parseSetext(source).children).toHaveLength(0);
    expect(parseSetext(source, false).children[0]).toMatchObject({ type: 'heading', depth: 2 });
  });
});
