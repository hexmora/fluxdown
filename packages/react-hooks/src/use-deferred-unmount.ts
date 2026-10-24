import { useEffect, useRef } from 'react';

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
