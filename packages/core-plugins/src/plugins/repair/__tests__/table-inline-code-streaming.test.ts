import { parseMarkdown, stripPositions, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { IncompleteInlineCodeRepairPlugin } from '../incomplete-inline-code';
import { runRepairs } from './utils';

const parse = (source: string, ending = true) =>
  parseMarkdown(source, [
    new SyntaxTableRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({
      plugins: [new IncompleteInlineCodeRepairPlugin()],
      ending,
      safe: false,
    }),
  ]);

const values = (source: string) => {
  const codes: string[] = [];

  walkMdast(parse(source), (node) => {
    if (node.type === 'inlineCode') {
      codes.push(node.value);
    }
  });

  return codes;
};

const table = '| A | B |\n|---|---|\n| stable | ';

describe('inline code in an open table cell', () => {
  test.each(['', '> ', '>> '])(
    'keeps code semantics through every character in container %s',
    (marker) => {
      const prefix = table
        .split('\n')
        .map((line) => marker + line)
        .join('\n');
      const code = '`a * b`';

      for (let offset = 1; offset <= code.length; offset += 1) {
        const expected = code.slice(1, Math.min(offset, code.length - 1));

        expect({
          source: prefix + code.slice(0, offset),
          codes: values(prefix + code.slice(0, offset)),
        }).toEqual({ source: prefix + code.slice(0, offset), codes: expected ? [expected] : [] });
      }
    },
  );

  test.each([
    String.raw`a \| b`,
    String.raw`a \\| b`,
    String.raw`a \\\| b`,
    'a &amp; b',
    'a \\* b',
  ])('matches GFM code decoding when the delimiter arrives: %s', (body) => {
    const open = table + '`' + body;
    const complete = open + '`';

    expect(values(open)).toEqual(values(complete));
    expect(parse(complete)).toEqual(parse(complete, false));
  });

  test.each(['|', '| ', '\n', '\r\n', '| another |'])(
    'keeps an unmatched backtick literal after the cell or row has closed: %s',
    (suffix) => {
      const source = table + '`literal ' + suffix;

      expect(parse(source)).toEqual(parse(source, false));
    },
  );

  test('repairs a table nested in a list and restores it when ending mode is disabled', () => {
    const source =
      '- item\n\n' +
      table
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n') +
      '`a * b';

    expect(values(source)).toEqual(['a * b']);
    expect(values(source + '` |')).toEqual(['a * b']);
  });

  test('uses only source provenance, including source after the last row', () => {
    const source = table + '`literal';
    const original = parse(source, false);
    const expected = stripPositions(parse(source));

    expect(runRepairs(stripPositions(original), new IncompleteInlineCodeRepairPlugin())).toEqual(
      expected,
    );

    const tableNode = original.children[0];

    if (tableNode?.type !== 'table') {
      throw new Error('Expected a table');
    }

    delete tableNode.data?.source;

    expect(runRepairs(original, new IncompleteInlineCodeRepairPlugin())).toEqual(original);
  });
});
