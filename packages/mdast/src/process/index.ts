import type { Parent, RootContent } from 'mdast';

import { assert } from '@fluxdown/utils';
import { first, last } from 'lodash-es';

import type { ProcessMdastParams } from './type';
import type { ProcessFrame } from './utils';

import { isMdastParent } from '../detect';
import { getChildren, getIndex } from './utils';

export * from './type';

/** Visits a mutable tree with child snapshots and live sibling positions. */
export const processMdast = <T extends RootContent | Parent>({
  node: root,
  runner,
  order = 'pre',
  rightFirst = false,
  scope = 'tree',
}: ProcessMdastParams<T>) => {
  let stopped = false;

  let skipped = false;

  let closed = false;

  const stack: ProcessFrame<T>[] = [{ parents: [], node: root }];

  // Post/in-order revisits parents, including siblings inserted by earlier runners.
  const seen = order === 'pre' ? undefined : new WeakMap<Parent | RootContent, true>();

  const assertOpen = (name: 'break' | 'skipTree') => {
    if (closed) {
      throw Error(`processMdast: ${name} must be called during a visit`);
    }
  };

  const breakWalk = () => {
    assertOpen('break');

    stopped = true;
  };

  const skipTree = () => {
    assertOpen('skipTree');

    skipped = true;
  };

  const visit = ({ node, parents }: ProcessFrame<T>) => {
    const parent = first(parents);

    const index = parent ? getIndex(parent, node) : undefined;

    if (index === -1) {
      return;
    }

    runner({
      node,
      parent,
      parents,
      index,
      break: breakWalk,
      skipTree,
      insertNext(content, replaceCurrent = false) {
        if (!parent) {
          return;
        }

        const offset = getIndex(parent, node);

        assert(offset !== -1, 'processMdast: cannot insert next to a detached node');

        parent.children.splice(
          replaceCurrent ? offset : offset + 1,
          replaceCurrent ? 1 : 0,
          ...content,
        );
      },
    });
  };

  while (stack.length) {
    const frame = stack.pop();

    assert(frame, 'processMdast: missing stack frame');

    const { node } = frame;

    const children = getChildren(frame, rightFirst, scope);

    switch (order) {
      case 'pre': {
        visit(frame);

        if (!skipped) {
          stack.push(...children);
        }

        break;
      }

      case 'post': {
        const pending = children.filter(({ node: child }) => !seen?.get(child));

        if (pending.length) {
          stack.push(frame, ...pending);
        } else {
          visit(frame);

          seen?.set(node, true);
        }

        break;
      }

      case 'in': {
        const split =
          isMdastParent(node) &&
          children.length > 0 &&
          children.every(({ node: child }) => !seen?.get(child));

        if (split) {
          const next = last(children);

          stack.push(...children.slice(0, -1), frame);

          if (next) {
            stack.push(next);
          }
        } else {
          visit(frame);

          seen?.set(node, true);
        }

        break;
      }
    }

    if (stopped) {
      break;
    }

    skipped = false;
  }

  closed = true;
};
