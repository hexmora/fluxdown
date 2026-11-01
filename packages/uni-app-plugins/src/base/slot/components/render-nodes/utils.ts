import type { Element } from 'hast';

import { isEqual, omit } from 'lodash-es';

import type {
  UniComponentNode,
  UniRenderNode,
  UniSlotNode,
  UniTextNode,
} from '../../../../typings/render';

export const flattenNodes = (
  nodes: UniRenderNode[],
): (string | number | UniSlotNode | UniComponentNode | UniTextNode)[] => {
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

export const isSlotNode = (node: UniRenderNode): node is UniSlotNode => {
  return node !== null && typeof node === 'object' && 'type' in node;
};

export const isGeneratedSlotKey = (key?: string) => {
  return key !== undefined && /^\d+:element:/.test(key);
};

export const isSameSlotSource = (left: UniSlotNode, right: UniSlotNode) => {
  const current = left.props.current as Element | undefined;

  const next = right.props.current as Element | undefined;

  return (
    left.type === right.type &&
    (left.key === right.key || (isGeneratedSlotKey(left.key) && isGeneratedSlotKey(right.key))) &&
    left.children !== undefined &&
    right.children !== undefined &&
    current?.type === 'element' &&
    next?.type === 'element' &&
    current.tagName === next.tagName &&
    current.properties !== undefined &&
    current.properties === next.properties &&
    current.position === next.position &&
    isEqual(
      omit(left.props, ['current', 'parents', 'render']),
      omit(right.props, ['current', 'parents', 'render']),
    )
  );
};

export const getNodeKey = (node: Exclude<UniRenderNode, UniRenderNode[] | null>, index: number) => {
  return isComponentNode(node) || isSlotNode(node) ? (node.key ?? index) : index;
};
