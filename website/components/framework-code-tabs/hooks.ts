import { useSyncExternalStore } from 'react';

import { CODE_FRAMEWORKS, FRAMEWORK_STORAGE_KEY } from './consts';

export type CodeFramework = (typeof CODE_FRAMEWORKS)[number];

let preference: CodeFramework | null = null;
let initialized = false;

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

const getSnapshot = () => {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true;

    try {
      const stored = window.localStorage.getItem(FRAMEWORK_STORAGE_KEY);
      preference = CODE_FRAMEWORKS.find((framework) => framework === stored) ?? null;
    } catch {
      // Code tabs still share an in-memory preference when storage is unavailable.
    }
  }

  return preference;
};

const getServerSnapshot = () => null;

const setFramework = (framework: CodeFramework) => {
  preference = framework;
  initialized = true;

  try {
    window.localStorage.setItem(FRAMEWORK_STORAGE_KEY, framework);
  } catch {
    // Keep the shared choice for this visit even when it cannot survive a reload.
  }

  for (const listener of listeners) listener();
};

export const useCodeFramework = () =>
  [useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), setFramework] as const;
