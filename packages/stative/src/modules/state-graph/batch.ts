import type { StateNode } from './node';

const pending = new Set<StateNode>();

let depth = 0;

let pendingErrors: unknown[] | null = null;

export const canSettle = () => pendingErrors !== null && depth === 0;

/** Keep settlement errors at the batch boundary, outside lazy emitter callbacks. */
export const settle = (node: StateNode) => {
  try {
    node.settle();
  } catch (error) {
    if (!pendingErrors) {
      throw error;
    }

    pendingErrors.push(error);
  }
};

const flush = () => {
  if (depth > 0 || pendingErrors) {
    return;
  }

  const errors: unknown[] = [];

  pendingErrors = errors;

  try {
    while (pending.size > 0) {
      const node = pending.values().next().value;

      if (node) {
        settle(node);
      }
    }
  } finally {
    pendingErrors = null;
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
