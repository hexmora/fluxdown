import type { UniComponentNode, UniRenderNode, UniSlotNode } from '../../../../typings/render';

export const flattenNodes = (
  nodes: UniRenderNode[],
): (string | number | UniSlotNode | UniComponentNode)[] => {
  return nodes.flatMap((node) => {
    if (Array.isArray(node)) {
      return flattenNodes(node);
    }

    return node === null ? [] : [node];
  });
};

export const isTextNode = (node: UniRenderNode): node is string | number => {
  return typeof node === 'string' || typeof node === 'number';
};

export const isComponentNode = (node: UniRenderNode): node is UniComponentNode => {
  return node !== null && typeof node === 'object' && 'component' in node;
};

export const getNodeKey = (node: Exclude<UniRenderNode, UniRenderNode[] | null>, index: number) => {
  return isTextNode(node) ? index : (node.key ?? index);
};
