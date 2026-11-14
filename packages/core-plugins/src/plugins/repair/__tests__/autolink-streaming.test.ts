import { parseMarkdown, walkMdast } from '../../remark/__tests__/utils';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxAutolinkRemarkPlugin } from '../../remark/syntax-autolink';
import { IncompleteHtmlTagRepairPlugin } from '../incomplete-html-tag';
import { IncompleteLinkRepairPlugin } from '../incomplete-link';

const parse = (source: string, ending = true) =>
  parseMarkdown(source, [
    new SyntaxAutolinkRemarkPlugin(),
    new ApplyRepairsRemarkPlugin({
      plugins: [new IncompleteLinkRepairPlugin(), new IncompleteHtmlTagRepairPlugin()],
      ending,
      safe: false,
    }),
  ]);

const visible = (source: string) => {
  const segments: string[] = [];

  walkMdast(parse(source), (node) => {
    if (node.type === 'text') {
      segments.push(node.value);
    }
  });

  return segments.join('');
};

describe('autolink suffix stability', () => {
  test.each(['https://example.test/path', 'review@example.test'])(
    'keeps an angle autolink label stable as its closer arrives: %s',
    (address) => {
      const confirmed = address.includes('@')
        ? address.indexOf('@') + 1
        : address.indexOf('//') + 3;

      for (let offset = confirmed; offset <= address.length; offset += 1) {
        const source = '<' + address.slice(0, offset);
        const tree = parse(source);
        const paragraph = tree.children[0];

        expect(visible(source)).toBe(address.slice(0, offset));
        expect(paragraph).toMatchObject({ type: 'paragraph', children: [{ type: 'link' }] });
      }

      expect(parse('<' + address + '>')).toEqual(parse('<' + address + '>', false));
    },
  );

  test.each(['https://example', 'review@example.test', 'www.example.test'])(
    'holds only uncertain terminal punctuation after an existing bare autolink: %s',
    (address) => {
      expect(visible(address + '.')).toBe(address);
      expect(visible(address + '.next')).toBe(address + '.next');
      expect(parse(address + '. ')).toEqual(parse(address + '. ', false));
      expect(parse(address + '.\n')).toEqual(parse(address + '.\n', false));
      expect(visible(address + '. ordinary')).toBe(address + '. ordinary');
      expect(parse(address + '.', false).children[0]).toMatchObject({
        type: 'paragraph',
        children: [{ type: 'link' }, { type: 'text', value: '.' }],
      });
    },
  );

  test.each([
    '[link](https://example.test).',
    'review@example.test&#33;',
    String.raw`review@example.test\!`,
    'https://example.test&#46;',
    String.raw`https://example.test\!`,
    String.raw`\<https://example.test`,
    '&lt;https://example.test',
    '`<https://example.test`',
    'a < b',
    '<span>plain</span>',
  ])('preserves complete Markdown links, literal angles, code, and HTML: %s', (source) => {
    expect(parse(source)).toEqual(parse(source, false));
  });
});
