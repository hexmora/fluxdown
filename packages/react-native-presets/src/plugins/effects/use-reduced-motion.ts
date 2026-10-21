import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

const listeners = new Set<() => void>();
let reduced = false;
let generation = 0;
let subscription: ReturnType<typeof AccessibilityInfo.addEventListener> | undefined;

const update = (value: boolean) => {
  if (reduced === value) return;
  reduced = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    const current = ++generation;
    subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      generation += 1;
      update(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (generation === current) update(value);
    });
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      generation += 1;
      subscription?.remove();
      subscription = undefined;
    }
  };
};

/** All animated characters share one native accessibility subscription. */
export const useReducedMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => reduced,
    () => false,
  );
