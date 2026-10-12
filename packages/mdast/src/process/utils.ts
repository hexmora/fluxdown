import type { Parent, RootContent } from 'mdast';

import { isMdastParent } from '../detect';

export type ProcessFrame<T> = {
  parents: Parent[];
  node: RootContent | T;
};

export const getIndex = (parent: Parent, node: Parent | RootContent): number => {
  const children: readonly (Parent | RootContent)[] = parent.children;

  return children.indexOf(node);
};

export const getChildren = <T extends Parent | RootContent>(
  { node, parents }: ProcessFrame<T>,
  rightFirst: boolean,
  scope: 'tree' | 'tail',
): ProcessFrame<T>[] => {
  if (!isMdastParent(node)) {
    return [];
  }

  const { children } = node;

  const frames: ProcessFrame<T>[] = [];

  const first = scope === 'tail' ? children.length - 1 : 0;

  // Capture the children before a runner can mutate them. The stack is LIFO.
  for (
    let index = rightFirst ? first : children.length - 1;
    rightFirst ? index < children.length : index >= first;
    index += rightFirst ? 1 : -1
  ) {
    const child = children[index];

    if (child) {
      frames.push({ node: child, parents: [node, ...parents] });
    }
  }

  return frames;
};
