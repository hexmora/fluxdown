import { useEffect, useRef } from '@lynx-js/react';

export const useDeferredUnmount = (callback: () => void): void => {
  const callbackRef = useRef(callback);

  const generationRef = useRef(0);

  callbackRef.current = callback;

  useEffect(() => {
    generationRef.current += 1;

    return () => {
      const generation = ++generationRef.current;

      void Promise.resolve().then(() => {
        if (generationRef.current === generation) {
          callbackRef.current();
        }
      });
    };
  }, []);
};
