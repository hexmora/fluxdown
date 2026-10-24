import type { Element, ElementContent, Root, RootContent } from 'hast';

import { sizeOfHast } from '@fluxdown/hast';

import { createSuffixRoot, isSuffixNode, SUFFIX_DATA_ATTR } from '../utils';

const text = (value: string) => ({ type: 'text' as const, value });
const element = (tagName: string, children: ElementContent[]): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});
const root = (...children: RootContent[]): Root => ({ type: 'root', children });

const markers = (node: Root | RootContent): Element[] => {
  if (node.type !== 'root' && isSuffixNode(node)) {
    return [node];
  }

  return 'children' in node ? node.children.flatMap(markers) : [];
};

describe('suffix HAST placement', () => {
  test('appends outside inline wrappers while preserving unrelated nodes and visible length', () => {
    const before = element('p', [text('before')]);
    const strong = element('strong', [text('tail')]);
    const source = root(before, text('\n'), element('p', [strong]));
    const output = createSuffixRoot(source, 'custom');
    const tail = output.children[2] as Element;

    expect(output.children[0]).toBe(before);
    expect(tail.children[0]).toBe(strong);
    expect(tail.children[1]).toMatchObject({
      tagName: 'span',
      properties: { [SUFFIX_DATA_ATTR]: 'custom' },
    });
    expect(markers(source)).toEqual([]);
    expect(markers(output)).toHaveLength(1);
    expect(sizeOfHast(output)).toBe(sizeOfHast(source));
  });

  test.each([
    'li',
    'td',
    'th',
    'h2',
    'section',
    'article',
    'summary',
    'figcaption',
    'caption',
    'dd',
    'dt',
  ])('keeps the suffix inside a final %s', (tag) => {
    const cell = element(tag, [element('a', [text('last')])]);
    const source = root(element('div', [cell, text('\n')]));
    const output = createSuffixRoot(source, 'dot');
    const parent = (output.children[0] as Element).children[0] as Element;

    expect(parent.children).toHaveLength(2);
    expect(markers(parent)).toHaveLength(1);
    expect(isSuffixNode(parent.children[1]!)).toBe(true);
  });

  test('places the marker before the synthetic code newline without changing code text', () => {
    const source = root(element('pre', [element('code', [text('const answer = 42;\n')])]));
    const output = createSuffixRoot(source, 'cursor');
    const code = (output.children[0] as Element).children[0] as Element;

    expect(code.children).toEqual([
      text('const answer = 42;'),
      {
        type: 'element',
        tagName: 'span',
        properties: { [SUFFIX_DATA_ATTR]: 'cursor' },
        children: [text('')],
      },
      text('\n'),
    ]);
    expect(sizeOfHast(output)).toBe(sizeOfHast(source));
  });

  test('does not descend into opaque math, hidden elements, or inline code', () => {
    const math = element('span', [text('x')]);
    math.properties.dataType = 'inline-math';
    const source = root(
      element('p', [math, element('code', [text('code')]), element('script', [text('hidden')])]),
    );
    const output = createSuffixRoot(source, 'dot');
    const paragraph = output.children[0] as Element;

    expect(paragraph.children[0]).toBe(math);
    expect(isSuffixNode(paragraph.children[2]!)).toBe(true);
    expect(paragraph.children[3]).toEqual(element('script', [text('hidden')]));
  });

  test('leaves an empty document unchanged', () => {
    const source = root();
    expect(createSuffixRoot(source, 'cursor')).toBe(source);
  });
});
