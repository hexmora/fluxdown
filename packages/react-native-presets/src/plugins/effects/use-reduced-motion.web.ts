import { useSyncExternalStore } from 'react';

interface MotionQuery {
  matches: boolean;
  addEventListener: (type: 'change', listener: () => void) => void;
  removeEventListener: (type: 'change', listener: () => void) => void;
}

let query: MotionQuery | undefined;
const getQuery = () => {
  const browser = globalThis as typeof globalThis & { matchMedia?: (query: string) => MotionQuery };
  return (query ??= browser.matchMedia?.('(prefers-reduced-motion: reduce)'));
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  const media = getQuery();
  listeners.add(listener);
  if (listeners.size === 1) media?.addEventListener('change', notify);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) media?.removeEventListener('change', notify);
  };
};

export const useReducedMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => getQuery()?.matches ?? false,
    () => false,
  );
