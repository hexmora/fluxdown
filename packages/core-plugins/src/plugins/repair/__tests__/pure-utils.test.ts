import type { Code, Parent, RootContent } from 'mdast';

import { getIncompleteFenceValue } from '../incomplete-code-fence/utils';
import { getInlineCodeValue } from '../incomplete-inline-code/utils';
import { getListMarkerCutoff } from '../incomplete-list-marker/utils';
import { getClosedParagraphChildren } from '../paragraph-html-closure/utils';
import { getTrailingBreakChildren } from '../redundant-trailing-break/utils';
import { paragraph } from './utils';

const freezeTree = <T extends Parent | RootContent>(node: T): T => {
  if ('children' in node) {
    node.children.forEach(freezeTree);
    Object.freeze(node.children);
  }

  if (node.data) {
    Object.freeze(node.data);
  }

  return Object.freeze(node);
};

describe('repair analysis utilities', () => {
  test('computes a fenced-code repair without mutating its source node', () => {
    const node = freezeTree<Code>({
      type: 'code',
      value: 'code\n``',
      data: { source: '```\ncode\n``' },
    });

    expect(getIncompleteFenceValue(node)).toBe('code');
    expect(node.value).toBe('code\n``');
    expect(node.data?.source).toBe('```\ncode\n``');
  });

  test('reconstructs inline code from node-local sources without mutating them', () => {
    const node = freezeTree(
      paragraph([
        { type: 'text', value: 'before ``code &', data: { source: 'before ``code &amp;' } },
        { type: 'html', value: '<span>', data: { source: '<span>' } },
        { type: 'text', value: 'tail', data: { source: 'tail' } },
      ]),
    );

    expect(getInlineCodeValue(node, 0, 7, 2)).toBe('code &amp;<span>tail');
    expect(node.children[0]?.data?.source).toBe('before ``code &amp;');
  });

  test('does not reconstruct inline code through a source-less sibling', () => {
    const node = freezeTree(
      paragraph([
        { type: 'text', value: 'before `code', data: { source: 'before `code' } },
        { type: 'html', value: '<span>' },
      ]),
    );

    expect(getInlineCodeValue(node, 0, 7, 1)).toBeUndefined();
  });

  test('computes a list cutoff without truncating its input', () => {
    const node = freezeTree({
      type: 'text' as const,
      value: 'before\n2.',
      data: { source: 'before\n2.' },
    });

    expect(getListMarkerCutoff(node, true)).toBe(6);
    expect(node.value).toBe('before\n2.');
  });

  test('returns closed HTML children without changing the paragraph', () => {
    const node = freezeTree(
      paragraph([
        { type: 'html', value: '<span>', data: { source: '<span>' } },
        { type: 'text', value: 'body', data: { source: 'body' } },
      ]),
    );
    const children = getClosedParagraphChildren(node);

    expect(children).toEqual([...node.children, { type: 'html', value: '</span>' }]);
    expect(node.children).toHaveLength(2);
    expect(children?.[0]).toBe(node.children[0]);
  });

  test('returns cleaned trailing text without copying its stale source', () => {
    const node = freezeTree(
      paragraph([
        { type: 'text', value: 'body\n', data: { source: 'body\n', stable: true } },
        { type: 'break' },
      ]),
    );

    expect(getTrailingBreakChildren(node)).toEqual([
      { type: 'text', value: 'body', data: { stable: true } },
    ]);
    expect(node.children).toHaveLength(2);
    expect(node.children[0]?.data?.source).toBe('body\n');
  });
});
