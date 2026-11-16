import type { Mapper, MapperInputs } from '@fluxdown/core';
import type { MapperConfigInputs as ConfigInputs, MapperPluginConfig } from '@fluxdown/types';
import type { IPluggableConfig } from '@fluxdown/types';

import { Shad, SHAD_DATA_ATTR, SHAD_FADE_VALUE } from '@fluxdown/core-plugins/plugins/mapper/shad';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { PluginPriority } from '@fluxdown/types';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';
import { reverse } from 'lodash-es';
import { createRef, StrictMode } from 'react';
import {
  type IReadableClosure,
  mapClosure,
  MutableState,
  once,
  toClosure,
  useClearable,
  useDefaults,
  useMap,
  useSwitchMap,
} from 'stative';

import type { EffectItem, FluxdownRef, StreamingConfig } from '../packs/full';

import { restoreGlobals } from '../../../../scripts/testing/globals';
import scaleStyles from '../../../react-plugins/src/plugins/effect-scale/slot/effect-scale/renderer/index.module.scss';
import { Fluxdown } from '../packs/full';
import { createRafClock } from './utils/raf';

declare global {
  interface EffectConfigs {
    'test-effect': MapperPluginConfig<{ count?: number }>;
  }
}

const Reverse = once(({ source }: MapperInputs) =>
  useMap(source, (blocks) => reverse([...blocks])),
);

const Limit = once(({ source, count }: MapperInputs<ConfigInputs<{ count: number }>>) =>
  useMap([source, count], ([blocks, limit]) => blocks.slice(0, limit)),
);

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  restoreGlobals();

  jest.useRealTimers();
});

const FADE = '[data-fluxdown-shad="fade"]';

describe('Fluxdown streaming effects', () => {
  test.each<{ effect: StreamingConfig['effect'] }>([{ effect: false }, { effect: [] }])(
    'leaves effects disabled with effect=$effect',
    ({ effect }) => {
      const view = render(<Fluxdown streaming={{ smooth: false, effect }} text="a" />);

      view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="abc" />);

      expect(view.container.textContent).toBe('abc');

      expect(view.container.querySelector(FADE)).toBeNull();
    },
  );

  test('updates shorthand and tuple effects while preserving the core and running fades', () => {
    jest.useFakeTimers();

    const ref = createRef<FluxdownRef>();

    const view = render(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: 'shad' }} text="a" />,
    );

    const core = ref.current;

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: 'shad' }} text="abcdef" />,
    );

    const fade = view.container.querySelector<HTMLElement>(FADE);

    expect(fade).toHaveTextContent('bcdef');

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ smooth: false, effect: ['shad', { duration: 800 }] }}
        text="abcdef"
      />,
    );

    // The running fade keeps its element and the duration it started with.
    expect(view.container.querySelector(FADE)).toBe(fade);

    expect(fade?.style.getPropertyValue('--fluxdown-shad-duration')).toBe('400ms');

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: false }} text="abcdef" />,
    );

    expect(view.container.querySelector(FADE)).toBeNull();

    expect(ref.current).toBe(core);
  });

  test.each([undefined, true])(
    'uses scale by default with effect=%s and disables it with false',
    (effect) => {
      jest.spyOn(performance, 'now').mockReturnValue(0);

      const view = render(<Fluxdown streaming={{ smooth: false, effect }} text="a" />);

      expect(view.container.querySelector(`.${scaleStyles.glyph}`)).toBeNull();

      view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="abc" />);

      expect(
        Array.from(
          view.container.querySelectorAll(`.${scaleStyles.active} .${scaleStyles.glyph}`),
          (node) => node.textContent,
        ),
      ).toEqual(['b', 'c']);

      expect(view.container.querySelector(`.${scaleStyles.active}`)).not.toBeNull();

      view.rerender(<Fluxdown streaming={{ smooth: false, effect: false }} text="abc" />);

      expect(view.container.querySelector(`.${scaleStyles.glyph}`)).toBeNull();

      view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="abc" />);

      expect(view.container.querySelector(`.${scaleStyles.glyph}`)).toBeNull();
    },
  );

  test('enables scale for streaming=true and keeps omitted streaming disabled', async () => {
    const clock = createRafClock();
    const view = render(<Fluxdown text="a" />);

    view.rerender(<Fluxdown text="ab" />);
    expect(view.container.querySelector(`.${scaleStyles.glyph}`)).toBeNull();

    view.rerender(<Fluxdown streaming text="ab" />);
    view.rerender(<Fluxdown streaming text="abc" />);

    await clock.advanceUntil(() => view.container.textContent === 'abc');

    expect(
      view.container.querySelector(`.${scaleStyles.active} .${scaleStyles.glyph}`),
    ).toHaveTextContent('c');
  });

  test('enables named effects when their optional enabled value is undefined', () => {
    const streaming: StreamingConfig = { smooth: false, effect: ['shad', { enabled: undefined }] };

    const view = render(<Fluxdown streaming={streaming} text="abc" />);

    view.rerender(<Fluxdown streaming={streaming} text="abcd" />);

    expect(view.container.querySelector(FADE)).toHaveTextContent('d');
  });

  test('accepts bare and configured mappers alongside plugin mappers', () => {
    const text = 'first\n\nsecond\n\nthird';

    const view = render(<Fluxdown streaming={{ effect: Reverse }} text={text} />);

    expect(view.container.textContent).toBe('thirdsecondfirst');

    view.rerender(<Fluxdown streaming={{ effect: [Limit, { count: 2 }] }} text={text} />);

    expect(view.container.textContent).toBe('firstsecond');

    view.rerender(
      <Fluxdown
        plugins={{ mappers: [Reverse] }}
        streaming={{ effect: [Limit, { count: 2 }] }}
        text={text}
      />,
    );

    expect(view.container.textContent).toBe('thirdsecond');

    view.rerender(
      <Fluxdown streaming={{ effect: [[Limit, { count: 2 }], Reverse, 'shad'] }} text={text} />,
    );

    expect(view.container.textContent).toBe('secondfirst');

    view.rerender(
      <Fluxdown
        streaming={{
          effect: [
            [Limit, { count: 2 }],
            [Reverse, { priority: PluginPriority.High }],
            ['shad', { length: 2 }],
          ],
        }}
        text={text}
      />,
    );

    expect(view.container.textContent).toBe('thirdsecond');
  });

  test('resolves merged effect keys from mapper presets and preserves their configuration', () => {
    expectTypeOf<Extract<EffectItem, ['test-effect', object]>>().toEqualTypeOf<
      ['test-effect', IPluggableConfig<MapperPluginConfig<{ count?: number }>>]
    >();

    expectTypeOf<Extract<EffectItem, 'test-effect'>>().toEqualTypeOf<'test-effect'>();

    const count = MutableState.of(2);

    const options = { value: count, destroy: jest.fn() };

    const received = jest.fn();

    const LimitPreset = Object.assign(
      once(({ source, count: size }: MapperInputs<ConfigInputs<{ count?: number }>>) => {
        received(size);

        return useMap([source, useDefaults(size, 1)], ([blocks, limit]) => blocks.slice(0, limit));
      }),
      { key: 'test-effect' },
    );

    const presets: Mapper[] = PRESET_MAPPER_PLUGINS;

    presets.push(LimitPreset);

    try {
      const view = render(
        <Fluxdown streaming={{ smooth: false, effect: 'test-effect' }} text={'first\n\nsecond'} />,
      );

      expect(view.container.textContent).toBe('first');

      view.rerender(
        <Fluxdown
          streaming={{ smooth: false, effect: ['test-effect', { count: options }] }}
          text={'first\n\nsecond'}
        />,
      );

      expect(view.container.textContent).toBe('firstsecond');

      expect(received).toHaveBeenCalledTimes(1);

      expect(received.mock.calls[0]?.[0]).not.toBe(options);

      act(() => count.next(1));

      expect(view.container.textContent).toBe('first');

      view.unmount();
    } finally {
      presets.splice(presets.indexOf(LimitPreset), 1);

      count.destroy();
    }
  });

  test('runs custom effects before or after shad in the declared order', () => {
    const observed = jest.fn();

    // Re-checks every block revision, because shad only marks characters that just appeared.
    const Observe = once(({ source }: MapperInputs) =>
      useSwitchMap(source, (blocks) =>
        mapClosure(
          blocks.map((block) => block.value),
          (roots) => {
            observed(
              roots.some((root) =>
                root.children.some(
                  (node) =>
                    'children' in node &&
                    node.children.some(
                      (child) =>
                        child.type === 'element' &&
                        child.properties[SHAD_DATA_ATTR] === SHAD_FADE_VALUE,
                    ),
                ),
              ),
            );

            return blocks;
          },
        ),
      ),
    );

    const view = render(
      <Fluxdown streaming={{ smooth: false, effect: [Observe, 'shad'] }} text="a" />,
    );

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: [Observe, 'shad'] }} text="abc" />);

    expect(observed).toHaveBeenLastCalledWith(false);

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: ['shad', Observe] }} text="abc" />);

    view.rerender(
      <Fluxdown streaming={{ smooth: false, effect: ['shad', Observe] }} text="abcd" />,
    );

    expect(observed).toHaveBeenLastCalledWith(true);
  });

  test('rebinds readable mapper options and releases effects through StrictMode updates', async () => {
    const count = MutableState.of(1);

    const destroyed = jest.fn();

    const received = jest.fn();

    const LimitReactive = once(
      ({ source, count: size }: MapperInputs & { count: IReadableClosure<number> }) => {
        received(size);

        useClearable(() => destroyed());

        return useMap([source, size], ([blocks, limit]) => blocks.slice(0, limit));
      },
    );

    const left = { value: count, destroy: jest.fn() };

    const right = { value: count, destroy: left.destroy };

    const content = (size: IReadableClosure<number>) => (
      <StrictMode>
        <Fluxdown
          streaming={{ effect: [LimitReactive, { count: size }] }}
          text={'first\n\nsecond'}
        />
      </StrictMode>
    );

    const view = render(
      <StrictMode>
        <Fluxdown text={'first\n\nsecond'} />
      </StrictMode>,
    );

    view.rerender(content(left));

    expect(view.container.textContent).toBe('first');

    const created = received.mock.calls.length;

    const input = received.mock.calls.at(-1)?.[0];

    view.rerender(content(right));

    expect(received).toHaveBeenCalledTimes(created);

    expect(received.mock.calls.at(-1)?.[0]).toBe(input);

    act(() => count.next(2));

    expect(view.container.textContent).toBe('firstsecond');

    view.rerender(
      <StrictMode>
        <Fluxdown streaming={{ effect: false }} text={'first\n\nsecond'} />
      </StrictMode>,
    );

    await waitFor(() => expect(destroyed).toHaveBeenCalledTimes(received.mock.calls.length));

    expect(count.closed).toBe(false);

    count.destroy();
  });

  test('passes an existing built-in mapper tuple through without rewriting its configuration', () => {
    const enabled = MutableState.of(true);

    const active = toClosure(enabled);

    const streaming: StreamingConfig = { smooth: false, effect: [Shad, { enabled: active }] };

    const view = render(<Fluxdown streaming={streaming} text="abc" />);

    view.rerender(<Fluxdown streaming={streaming} text="abcd" />);

    expect(view.container.querySelector(FADE)).toHaveTextContent('d');

    act(() => enabled.next(false));

    expect(view.container.querySelector(FADE)).toBeNull();

    enabled.destroy();
  });
});
