import type { RootContent } from 'hast';

import { getTextUnits, sizeOfHast, sliceHast } from '@fluxdown/hast';
import { isEqual } from 'lodash-es';

import type { HastRoot } from '../../../typings';

const getUnits = function* (nodes: RootContent[]): Generator<unknown> {
  for (const node of nodes) {
    if (node.type === 'text') {
      yield* getTextUnits(node.value);
    } else if (node.type === 'element' && node.children.length > 0) {
      yield* getUnits(node.children);
    } else if (sizeOfHast({ type: 'root', children: [node] }) > 0) {
      yield node.type === 'element' ? [node.tagName, node.properties] : node;
    }
  }
};

/** Compare the same visible units that smoothing slices, only after source replacement. */
export const getCommonPrefixLength = (previous: HastRoot, current: HastRoot) => {
  const left = getUnits(sliceHast(previous, 0, Infinity)?.children ?? []);

  const right = getUnits(sliceHast(current, 0, Infinity)?.children ?? []);

  let length = 0;

  for (const unit of left) {
    const next = right.next();

    if (next.done || !isEqual(unit, next.value)) {
      break;
    }

    length += 1;
  }

  return length;
};
