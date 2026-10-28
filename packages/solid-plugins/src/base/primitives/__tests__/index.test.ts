import { createRoot, createSignal } from 'solid-js';
import { MutableState } from 'stative';

import { createStateOf, createStateValue } from '..';

describe('state primitives', () => {
  test('bridges reactive values with the supplied equality policy', () => {
    createRoot((dispose) => {
      const [source, setSource] = createSignal({ text: 'first' });

      const state = createStateOf(source, (previous, next) => previous.text === next.text);

      const changed = vi.fn();

      state.subscribe(changed);

      changed.mockClear();

      setSource({ text: 'first' });

      expect(changed).not.toHaveBeenCalled();

      setSource({ text: 'second' });

      expect(state.value).toEqual({ text: 'second' });

      expect(changed).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  test('switches state subscriptions and stops observing the previous source', () => {
    const first = new MutableState({ initial: 'first' });

    const second = new MutableState({ initial: 'second' });

    createRoot((dispose) => {
      const [source, setSource] = createSignal(first);

      const value = createStateValue(source);

      expect(value()).toBe('first');

      setSource(second);

      first.next('retired');

      expect(value()).toBe('second');

      second.next('active');

      expect(value()).toBe('active');

      dispose();

      second.next('disposed');

      expect(value()).toBe('active');
    });

    first.destroy();

    second.destroy();
  });
});
