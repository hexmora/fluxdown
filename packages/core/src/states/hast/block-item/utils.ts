import type { HastProjection } from '@fluxdown/hast';
import type { RootContent } from 'hast';

import { createHastProjection, getTextUnits, sizeOfHast } from '@fluxdown/hast';
import { isEqual } from 'lodash-es';

import type { HastRoot } from '../../../typings';

// Compiled roots are immutable revisions; weak keys release their indexes with the roots.
const projections = /*#__PURE__*/ new WeakMap<HastRoot, HastProjection>();

export const getHastProjection = (root: HastRoot) => {
  let projection = projections.get(root);

  if (!projection) {
    projection = createHastProjection(root);

    projections.set(root, projection);
  }

  return projection;
};

export const retainHastProjection = (projection: HastProjection) => {
  projections.set(projection.root, projection);

  return projection.root;
};

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
  const left = getUnits(getHastProjection(previous).full?.root.children ?? []);

  const right = getUnits(getHastProjection(current).full?.root.children ?? []);

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
