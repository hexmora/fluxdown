import { renderHook } from '@testing-library/react';

import { useLatestFn } from '..';

describe('useLatestFn', () => {
  test('keeps one function reference while invoking the latest closure', () => {
    const { result, rerender } = renderHook(
      ({ label }: { label: string }) => useLatestFn((suffix: string) => `${label}:${suffix}`),
      { initialProps: { label: 'first' } },
    );

    const initial = result.current;

    expect(initial('value')).toBe('first:value');

    rerender({ label: 'second' });

    expect(result.current).toBe(initial);
    expect(initial('value')).toBe('second:value');
  });

  test('preserves null and undefined and restores the same function when enabled again', () => {
    interface Props {
      target: ((value: number) => number) | null | undefined;
    }

    const initialProps: Props = { target: undefined };

    const { result, rerender } = renderHook(({ target }: Props) => useLatestFn(target), {
      initialProps,
    });

    expect(result.current).toBeUndefined();

    rerender({ target: (value) => value + 1 });

    const initial = result.current;

    expect(initial?.(1)).toBe(2);

    rerender({ target: null });

    expect(result.current).toBeNull();
    expect(initial?.(1)).toBeUndefined();

    rerender({ target: (value) => value + 2 });

    expect(result.current).toBe(initial);
    expect(initial?.(1)).toBe(3);

    rerender({ target: undefined });

    expect(result.current).toBeUndefined();
    expect(initial?.(1)).toBeUndefined();
  });
});
