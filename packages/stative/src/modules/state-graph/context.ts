import type { StateNode } from './node';

let current: StateNode | null = null;

type StateContextOptions = { ordering?: boolean };

let currentOptions: StateContextOptions | undefined;

export const getStateContext = () => current;

export const getStateContextOptions = () => currentOptions;

export const withStateContext = <T>(
  node: StateNode | null,
  runner: () => T,
  options?: StateContextOptions,
): T => {
  const previous = current;

  const previousOptions = currentOptions;

  current = node;

  currentOptions = options;

  try {
    return runner();
  } finally {
    current = previous;

    currentOptions = previousOptions;
  }
};
