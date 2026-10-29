import { getTextUnits } from '@fluxdown/hast';

import type { UniRenderNode } from '../../../../../typings/render';

import { flattenNodes, isTextNode } from '../../../../../base/slot/components/render-nodes/utils';
import ShadText from './components/text/index.uvue';

const getText = (node: UniRenderNode): string => {
  if (isTextNode(node)) {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getText).join('');
  }

  return node && 'type' in node && node.children ? getText(node.children) : '';
};

export const shadeNodes = (
  leading: UniRenderNode,
  active: UniRenderNode,
  offset = 0,
  enabled = true,
) => {
  const maskText = enabled ? getText(active) : '';

  const prefix = getText(leading).length;

  const text = getText([leading, active]);

  let cursor = 0;

  let position = offset;

  const visitChildren = (children: UniRenderNode[]): UniRenderNode[] => {
    const merged: UniRenderNode[] = [];

    for (const node of flattenNodes(children)) {
      const previous = merged.at(-1);

      if (previous !== undefined && isTextNode(previous) && isTextNode(node)) {
        merged[merged.length - 1] = `${previous}${node}`;
      } else {
        merged.push(node);
      }
    }

    return merged.map(visit);
  };

  const visit = (node: UniRenderNode): UniRenderNode => {
    if (typeof node === 'string' || typeof node === 'number') {
      const value = String(node);

      const start = position;

      const leadingLength = Math.max(0, Math.min(value.length, prefix - cursor));

      cursor += value.length;

      position += [...getTextUnits(value)].length;

      const shaded: UniRenderNode = {
        component: ShadText,
        props: {
          text: value,
          trailingText: text.slice(cursor),
          maskText,
          prefix: leadingLength,
          offset: start,
        },
      };

      return shaded;
    }

    if (node && 'type' in node && node.children) {
      return { ...node, children: visitChildren(node.children) };
    }

    return node;
  };

  return visitChildren([leading, active]);
};
