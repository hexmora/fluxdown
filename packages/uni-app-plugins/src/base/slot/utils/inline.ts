import type { UniRenderNode, UniTextNode } from '../../../typings/render';

export const isInlineTextNode = (node: UniRenderNode): node is UniTextNode => {
  return node !== null && typeof node === 'object' && 'text' in node;
};

export const getInlineText = (node: UniRenderNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (isInlineTextNode(node)) {
    return node.text;
  }

  if (Array.isArray(node)) {
    return node.map(getInlineText).join('');
  }

  return node && 'type' in node && node.children ? getInlineText(node.children) : '';
};

export const hasInlineEffect = (nodes: UniRenderNode[]): boolean => {
  return nodes.some((node) => {
    if (Array.isArray(node)) {
      return hasInlineEffect(node);
    }

    if (isInlineTextNode(node)) {
      return node.effect !== undefined;
    }

    if (node && typeof node === 'object' && 'type' in node) {
      return ['Scale', 'Chunk', 'Shad'].includes(node.type) || hasInlineEffect(node.children ?? []);
    }

    return false;
  });
};

export const mapInlineText = (
  nodes: UniRenderNode[],
  map: (text: string) => UniTextNode,
): UniRenderNode[] => {
  return nodes.map((node) => {
    if (typeof node === 'string' || typeof node === 'number' || isInlineTextNode(node)) {
      return map(getInlineText(node));
    }

    if (Array.isArray(node)) {
      return mapInlineText(node, map);
    }

    if (node && 'type' in node && node.children) {
      return { ...node, children: mapInlineText(node.children, map) };
    }

    return node;
  });
};
