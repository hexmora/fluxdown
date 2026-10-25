import { renderHook } from '@testing-library/react';

import { useMemoValue } from '..';

describe('useMemoValue', () => {
  test('retains an equal value and replaces it when the comparison changes', () => {
    interface Value {
      id: number;
      label: string;
    }

    const initial: Value = { id: 1, label: 'initial' };

    const { result, rerender } = renderHook(
      ({ value }: { value: Value }) => useMemoValue(value, (left, right) => left.id === right.id),
      { initialProps: { value: initial } },
    );

    rerender({ value: { id: 1, label: 'equal but new' } });

    expect(result.current).toBe(initial);

    const changed: Value = { id: 2, label: 'changed' };

    rerender({ value: changed });

    expect(result.current).toBe(changed);
  });
});
