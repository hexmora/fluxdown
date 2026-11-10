import type { Parent, RootContent, RootContentMap } from 'mdast';

import { last } from 'lodash-es';

export const isRepairNodeType = <T extends keyof RootContentMap>(
  node: Parent | RootContent,
  type: T,
): node is RootContentMap[T] => {
  return node.type === type;
};

export const isRepairTreeTail = (node: Parent | RootContent, parents: Parent[]): boolean => {
  let child = node;

  for (const parent of parents) {
    if (last(parent.children) !== child) {
      return false;
    }

    child = parent;
  }

  return true;
};
