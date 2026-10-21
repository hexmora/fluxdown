import { useEffect, useRef } from 'react';

export const useStatic = <T>(factory: () => T): T => {
  const valueRef = useRef<{ value: T } | null>(null);

  // Resource factories must not be invoked twice by useMemo's StrictMode check.
  if (!valueRef.current) {
    valueRef.current = { value: factory() };
  }

  return valueRef.current.value;
};

export const useDeferredUnmount = (callback: () => void): void => {
  const callbackRef = useRef(callback);

  const generationRef = useRef(0);

  callbackRef.current = callback;

  useEffect(() => {
    generationRef.current += 1;

    return () => {
      const generation = ++generationRef.current;

      queueMicrotask(() => {
        if (generationRef.current === generation) {
          callbackRef.current();
        }
      });
    };
  }, []);
};
