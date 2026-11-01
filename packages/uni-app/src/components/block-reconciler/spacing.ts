import type { ThemeTokens, UniRenderNode, UniSlotNode } from '@fluxdown/uni-app-plugins/typings';
import type { Root } from 'hast';

import { getBlockSpacing } from '@fluxdown/uni-app-plugins/base';
import { findLast } from 'lodash-es';

import type { BlockEdges } from './type';

const getSlotTag = (node: UniSlotNode): string => {
  switch (node.type) {
    case 'Heading':
      return `h${node.props.level}`;

    case 'Paragraph':
      return 'p';

    case 'Blockquote':
      return 'blockquote';

    case 'CodeBlock':
      return 'pre';

    case 'Table':
      return 'table';

    case 'List':
      return 'ul';

    default:
      return '';
  }
};

const applySpacing = (
  nodes: UniRenderNode[],
  tokens: ThemeTokens,
  previousBottom: number,
  first: boolean,
  last: boolean,
): UniRenderNode[] => {
  const entries = nodes.filter((node) => node !== null);

  return entries.map((node, index) => {
    if (node === null || typeof node !== 'object' || !('type' in node)) {
      previousBottom = 0;

      return node;
    }

    const spacing = getBlockSpacing(getSlotTag(node), tokens);

    if (!spacing) {
      previousBottom = 0;

      return node;
    }

    const marginTop = first && index === 0 ? 0 : Math.max(0, spacing.marginTop - previousBottom);

    previousBottom = spacing.marginBottom;

    return {
      ...node,
      children:
        node.type === 'Blockquote' && node.children
          ? applySpacing(node.children, tokens, 0, true, true)
          : node.children,
      props: {
        ...node.props,
        style: [
          node.props.style,
          {
            marginTop: `${marginTop}px`,
            marginBottom: `${last && index === entries.length - 1 ? 0 : spacing.marginBottom}px`,
          },
        ],
      },
    };
  });
};

export const normalizeBlockSpacing = (
  nodes: UniRenderNode[],
  edges: BlockEdges,
  previous: Root | null,
  tokens: ThemeTokens,
): UniRenderNode[] => {
  const previousElement = findLast(previous?.children, (node) => node.type === 'element');

  const previousBottom =
    previousElement?.type === 'element'
      ? (getBlockSpacing(previousElement.tagName, tokens)?.marginBottom ?? 0)
      : 0;

  return applySpacing(nodes, tokens, previousBottom, edges.first, edges.last);
};
