import type { Parent } from 'mdast';

import { isRepairMarker } from '../../../utils';

export const isIncompleteTaskMarker = (node: Parent, parents: Parent[]): boolean => {
  const parent = parents[0];

  const child = node.children[0];

  return (
    parent?.type === 'listItem' &&
    parent.children[0] === node &&
    node.children.length === 1 &&
    child?.type === 'text' &&
    /^(?:\[|\[[ xX]|\[[ xX]\][ \t]*)$/.test(child.value) &&
    isRepairMarker(child, 0, child.value.length)
  );
};
