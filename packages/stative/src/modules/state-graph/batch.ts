import type { StateNode } from './node';

const pending = new Set<StateNode>();

let depth = 0;

let flushing = false;

export const canSettle = () => flushing && depth === 0;

const flush = () => {
  if (depth > 0 || flushing) {
    return;
  }

  const errors: unknown[] = [];

  flushing = true;

  try {
    while (pending.size > 0) {
      const node = pending.values().next().value;

      try {
        node?.settle();
      } catch (error) {
        errors.push(error);
      }
    }
  } finally {
    flushing = false;
  }

  if (errors.length > 0) {
    throw errors[0];
  }
};

export const enqueue = (node: StateNode) => {
  pending.add(node);

  flush();
};

export const dequeue = (node: StateNode) => {
  pending.delete(node);
};

/** Publish one consistent update when the outermost synchronous batch finishes. */
export const batch = <T>(runner: () => T): T => {
  depth += 1;

  try {
    return runner();
  } finally {
    depth -= 1;

    flush();
  }
};
