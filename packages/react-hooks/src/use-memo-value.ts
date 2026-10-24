import { useRef } from 'react';

export type Comparable = object | null | undefined;

export const useMemoValue = <T extends Comparable>(
  value: T,
  compareFn: (a: T, b: T) => boolean,
): T => {
  const currentValue = useRef(value);

  if (!compareFn(value, currentValue.current)) {
    currentValue.current = value;
  }

  return currentValue.current;
};
