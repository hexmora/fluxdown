import type { StateNode } from './node';

let current: StateNode | null = null;

export const getStateContext = () => current;

export const withStateContext = <T>(node: StateNode | null, runner: () => T): T => {
  const previous = current;

  current = node;

  try {
    return runner();
  } finally {
    current = previous;
  }
};
