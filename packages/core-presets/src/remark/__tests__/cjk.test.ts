import type { Link, Paragraph, Root } from 'mdast';

import {
  CjkRemarkPlugin,
  PatchesRemarkPlugin,
  PRESET_REMARK_PLUGINS,
  SyntaxAutolinkRemarkPlugin,
  SyntaxStrikethroughRemarkPlugin,
} from '..';
import {
  collectTextValues,
  getAstProcessorByPlugins,
  parseMarkdown,
  stripPositions,
  walkMdast,
} from './utils';

const parseCjk = (text: string) =>
  parseMarkdown(text, [
    new CjkRemarkPlugin(),
    new SyntaxAutolinkRemarkPlugin(),
    new SyntaxStrikethroughRemarkPlugin(),
  ]);

const getLinks = (tree: Root): Link[] => {
  const links: Link[] = [];

  walkMdast(tree, (node) => {
    if (node.type === 'link') {
      links.push(node);
    }
  });

  return links;
};

describe('CjkRemarkPlugin', () => {
  test('requires explicit registration', () => {
    expect(PRESET_REMARK_PLUGINS).not.toContain(CjkRemarkPlugin);

    const text = '这是**加粗。**文字。';

    expect((parseMarkdown(text).children[0] as Paragraph).children).toEqual([
      expect.objectContaining({ type: 'text', value: text }),
    ]);
    expect((parseCjk(text).children[0] as Paragraph).children.map(({ type }) => type)).toEqual([
      'text',
      'strong',
      'text',
    ]);
  });

  test.each([
    ['这是**加粗。**文字。', 'strong', '加粗。'],
    ['これは*強調。*です。', 'emphasis', '強調。'],
    ['이것은~~삭제。~~입니다.', 'delete', '삭제。'],
    ['**この用語（読み方など）**について説明します。', 'strong', 'この用語（読み方など）'],
    ['**한국어 구문(괄호 포함)**을 강조.', 'strong', '한국어 구문(괄호 포함)'],
    ['~~删除的文字（带括号）。~~这句子继续。', 'delete', '删除的文字（带括号）。'],
  ])('parses CJK punctuation in %s', (text, type, value) => {
    const paragraph = parseCjk(text).children[0] as Paragraph;

    expect(paragraph.children).toContainEqual(
      expect.objectContaining({
        type,
        children: [expect.objectContaining({ type: 'text', value })],
      }),
    );
  });

  test.each([true, false])('preserves singleTilde: %s', (singleTilde) => {
    const tree = parseMarkdown('~删除。~文字 ~~删除。~~文字', [
      new CjkRemarkPlugin(),
      new SyntaxStrikethroughRemarkPlugin({ singleTilde }),
    ]);

    expect(
      (tree.children[0] as Paragraph).children.filter(({ type }) => type === 'delete'),
    ).toHaveLength(singleTilde ? 2 : 1);
  });

  test('does not enable strikethrough or autolinks without their syntax plugins', () => {
    const text = '~~删除。~~文字 https://example.com。文字';
    const tree = parseMarkdown(text, [new CjkRemarkPlugin()]);

    expect((tree.children[0] as Paragraph).children).toEqual([
      expect.objectContaining({ type: 'text', value: text }),
    ]);
  });

  test.each([...'。．，、？！：；（）【】「」『』〈〉《》'])(
    'ends bare links before %s',
    (boundary) => {
      const text = `https://example.com/路径${boundary}文字`;
      const tree = parseCjk(text);

      expect(getLinks(tree).map(({ url }) => url)).toEqual(['https://example.com/路径']);
      expect(collectTextValues(tree).join('')).toBe(text);
    },
  );

  test.each([
    [
      'https://a.com；https://b.com；https://c.com',
      ['https://a.com', 'https://b.com', 'https://c.com'],
    ],
    ['www.example.com。说明', ['http://www.example.com']],
    [
      'https://a.com。www.example.com；person@example.com',
      ['https://a.com', 'http://www.example.com', 'mailto:person@example.com'],
    ],
    ['https://a.com😀。；https://b.com/path).', ['https://a.com😀', 'https://b.com/path']],
    ['https://a.com。www.invalid_', ['https://a.com', 'http://www.invalid']],
  ])('preserves URLs and text in %s', (text, urls) => {
    const tree = parseCjk(text);

    expect(getLinks(tree).map(({ url }) => url)).toEqual(urls);
    expect(collectTextValues(tree).join('')).toBe(text);
  });

  test.each([
    'http://',
    'https://',
    'www.',
    'mailto:',
    'abchttps://example.com',
    'www.invalid_foo.com',
  ])('does not link the invalid suffix %s', (suffix) => {
    const text = `https://example.com。${suffix}`;
    const tree = parseCjk(text);

    expect(getLinks(tree).map(({ url }) => url)).toEqual(['https://example.com']);
    expect(collectTextValues(tree).join('')).toBe(text);
  });

  test('does not parse Markdown again inside a swallowed URL suffix', () => {
    const text = 'https://example.com。**说明**';
    const tree = parseCjk(text);

    expect(
      (tree.children[0] as Paragraph).children.every(
        ({ type }) => type === 'link' || type === 'text',
      ),
    ).toBe(true);
    expect(collectTextValues(tree).join('')).toBe(text);
  });

  test.each([
    '[https://example.com。说明](https://example.com。说明)',
    '<https://example.com。说明>',
    '[文档](https://example.com/路径。)',
    '[https://example.com。说明][link]\n\n[link]: https://example.com。说明',
    '`https://example.com。说明 **文字。**`',
    '```md\nhttps://example.com。说明 **文字。**\n```',
    '**English punctuation.** and *ordinary emphasis* ~~deleted~~',
    'https://example.com/路径?q=中文%EF%BC%9B后续',
  ])('preserves explicit links, code, and ordinary Markdown in %s', (text) => {
    const baseline = parseMarkdown(text, [
      new SyntaxAutolinkRemarkPlugin(),
      new SyntaxStrikethroughRemarkPlugin(),
    ]);

    expect(stripPositions(parseCjk(text))).toEqual(stripPositions(baseline));
  });

  test('keeps source positions aligned after splitting a literal autolink', () => {
    const text = '链接 https://example.com😀。https://other.com；文字';
    const tree = parseCjk(text);

    walkMdast(tree, (node) => {
      if (node.type !== 'text' || !node.position) {
        return;
      }

      const { start, end } = node.position;

      expect(text.slice(start.offset, end.offset)).toBe(node.value);
      expect(end.column - start.column).toBe(node.value.length);
    });
  });

  test.each([
    '<https://example.com。说明>',
    '[https://example.com。说明](https://example.com。说明)',
  ])('preserves explicit links without a source file in %s', (text) => {
    const processor = getAstProcessorByPlugins({
      remarks: [new CjkRemarkPlugin(), new SyntaxAutolinkRemarkPlugin()],
    });
    const tree = processor.runSync(processor.parse(text)) as Root;

    expect(getLinks(tree).map(({ url }) => url)).toEqual(['https://example.com。说明']);
  });

  test('keeps trailing text available to source-range patches', () => {
    const text = 'https://example.com。文字';
    const tree = parseMarkdown(text, [
      new CjkRemarkPlugin(),
      new SyntaxAutolinkRemarkPlugin(),
      new PatchesRemarkPlugin({ patches: [{ key: 'tail', range: [20, 22] }] }),
    ]);

    expect(getLinks(tree).map(({ url }) => url)).toEqual(['https://example.com']);
    expect((tree.children[0] as Paragraph).children).toContainEqual(
      expect.objectContaining({ type: 'parserPatch' }),
    );
  });
});
