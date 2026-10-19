import type { MapperInputs } from '@fluxdown/core';
import type { MapperConfigInputs as ConfigInputs, MapperPluginConfig } from '@fluxdown/types';

import { act, cleanup, render } from '@testing-library/react';
import { type IReadableClosure, MutableState, once, toClosure, useDefaults, useMap } from 'stative';

import { Fluxdown } from '..';

type PreviewConfig = { count?: number };

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

describe('reactive mapper configuration', () => {
  test.each(['plugins', 'effects'] as const)(
    'keeps %s inputs stable through omitted, plain and readable configuration',
    async (channel) => {
      const first = MutableState.of<number | undefined>(2);

      const second = MutableState.of<number | undefined>(3);

      const firstClosure = toClosure(first);

      const secondClosure = toClosure(second);

      const received = jest.fn();

      const Preview = once(({ source, count }: MapperInputs<ConfigInputs<PreviewConfig>>) => {
        received(count);

        return useMap([source, useDefaults(count, 1)], ([blocks, size]) => blocks.slice(0, size));
      });

      const content = (config: MapperPluginConfig<PreviewConfig>) => (
        <Fluxdown
          text={'first\n\nsecond\n\nthird'}
          plugins={channel === 'plugins' ? { mappers: [[Preview, config]] } : undefined}
          streaming={channel === 'effects' ? { smooth: false, effect: [Preview, config] } : false}
        />
      );

      const view = render(content({}));

      const input: IReadableClosure<number | undefined> = received.mock.calls[0]?.[0];

      expect(view.container.textContent).toBe('first');

      view.rerender(content({ count: 3 }));

      expect(view.container.textContent).toBe('firstsecondthird');

      view.rerender(content({ count: firstClosure }));

      expect(view.container.textContent).toBe('firstsecond');

      act(() => first.next(1));

      expect(view.container.textContent).toBe('first');

      view.rerender(content({ count: secondClosure }));

      expect(view.container.textContent).toBe('firstsecondthird');

      act(() => first.next(2));

      expect(view.container.textContent).toBe('firstsecondthird');

      act(() => second.next(undefined));

      expect(view.container.textContent).toBe('first');

      view.rerender(content({ count: 2 }));

      act(() => second.next(3));

      expect(view.container.textContent).toBe('firstsecond');

      view.rerender(content({}));

      expect(view.container.textContent).toBe('first');

      expect(input.value.value).toBeUndefined();

      expect(received).toHaveBeenCalledTimes(1);

      view.unmount();

      await act(async () => {});

      expect(input.value.closed).toBe(true);

      expect(first.closed).toBe(false);

      expect(second.closed).toBe(false);

      first.destroy();

      second.destroy();
    },
  );
});
