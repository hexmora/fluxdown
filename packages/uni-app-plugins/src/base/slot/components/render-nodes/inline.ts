import { getTextUnits } from '@fluxdown/hast';

import type {
  UniComponentNode,
  UniRenderNode,
  UniSlotNode,
  UniTextNode,
} from '../../../../typings/render';
import type { Slots } from '../../type';

import { splitInlineText } from '../../../components/inherited-text/utils';
import { InlineText } from '../../../components/inline-text';
import { flattenNodes, getInlineText, isInlineTextNode, isTextNode } from '../../utils';
import { isGeneratedSlotKey, isSameSlotSource, isSlotNode } from './utils';

const expandNodes = (nodes: UniRenderNode[], slots: Slots): UniRenderNode[] => {
  const expanded = flattenNodes(nodes).flatMap((node) => {
    if (node && typeof node === 'object' && 'type' in node) {
      const plugin = slots[node.type]?.at(-1);

      const inline = plugin?.renderInline?.({
        ...plugin.props,
        ...node.props,
        children: node.children,
      });

      if (inline !== undefined && inline !== null) {
        return expandNodes(inline, slots);
      }
    }

    return [node];
  });

  const result: UniRenderNode[] = [];

  for (const node of expanded) {
    if (node === '' || (isInlineTextNode(node) && node.text === '')) {
      continue;
    }

    const previous = result.at(-1);

    if (previous && isSlotNode(previous) && isSlotNode(node) && isSameSlotSource(previous, node)) {
      result[result.length - 1] = {
        ...previous,
        children: [...previous.children!, ...node.children!],
      };
    } else {
      result.push(node);
    }
  }

  return result;
};

export const normalizeInlineNodes = (nodes: UniRenderNode[], slots: Slots) => {
  const result: (UniComponentNode | UniSlotNode)[] = [];

  let pending: UniTextNode[] = [];

  let position = 0;

  // Keep tail animations running when preceding text grows.
  let suffixIndex = 0;

  const flush = () => {
    const text = pending.map((part) => part.text).join('');

    const words = splitInlineText(text);

    let index = 0;

    let consumed = 0;

    for (const word of words) {
      const parts: UniTextNode[] = [];

      let remaining = word.length;

      let wordOffset = 0;

      while (remaining > 0) {
        const part = pending[index]!;

        const length = Math.min(remaining, part.text.length - consumed);

        const value = word.slice(wordOffset, wordOffset + length);

        parts.push(part.effect ? { text: value, effect: part.effect } : { text: value });

        remaining -= length;

        consumed += length;

        wordOffset += length;

        if (consumed === part.text.length) {
          index += 1;

          consumed = 0;
        }
      }

      result.push({
        component: InlineText,
        key: `inline:${position}`,
        props: { parts },
      });

      position += [...getTextUnits(word)].length;
    }

    pending = [];
  };

  for (const node of expandNodes(nodes, slots)) {
    if (isTextNode(node) || isInlineTextNode(node)) {
      const part = isInlineTextNode(node) ? node : { text: String(node) };

      if (part.text) {
        pending.push(part);
      }

      continue;
    }

    if (!node || Array.isArray(node)) {
      continue;
    }

    flush();

    if (isSlotNode(node) && isGeneratedSlotKey(node.key)) {
      const key =
        node.type === 'Suffix'
          ? `inline:suffix:${suffixIndex++}`
          : `inline:${position}:${node.type}`;

      result.push({ ...node, key });
    } else {
      result.push(node);
    }

    position += [...getTextUnits(getInlineText(node))].length || 1;
  }

  flush();

  return result;
};
