import { useCallback, useRef } from '@lynx-js/react';

type FunctionType<P extends unknown[], R> = (...params: P) => R;

export function useLatestFn<P extends unknown[], R>(target: FunctionType<P, R>): FunctionType<P, R>;

export function useLatestFn<P extends unknown[], R>(
  target: FunctionType<P, R> | undefined,
): FunctionType<P, R> | undefined;

export function useLatestFn<P extends unknown[], R>(
  target: FunctionType<P, R> | null,
): FunctionType<P, R> | null;

export function useLatestFn<P extends unknown[], R>(
  target: FunctionType<P, R> | null | undefined,
): FunctionType<P, R> | null | undefined;

export function useLatestFn<P extends unknown[], R>(
  target: FunctionType<P, R> | null | undefined,
): FunctionType<P, R> | null | undefined {
  const targetRef = useRef(target);

  targetRef.current = target;

  const memoedFunction: FunctionType<P, R> = useCallback((...params) => {
    return targetRef.current?.(...params) as R;
  }, []);

  return target && memoedFunction;
}
