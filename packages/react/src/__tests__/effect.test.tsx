import type { Mapper, MapperInputs } from '@fluxdown/core';
import type { MapperConfigInputs as ConfigInputs, MapperPluginConfig } from '@fluxdown/types';
import type { IPluggableConfig } from '@fluxdown/types';

import {
  PRESET_MAPPER_PLUGINS,
  Shad,
  SHAD_DATA_ATTR,
  SHAD_HOST_VALUE,
} from '@fluxdown/core-presets/mapper';
import { PluginPriority } from '@fluxdown/types';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';
import { reverse } from 'lodash-es';
import { createRef, StrictMode } from 'react';
import {
  type IReadableClosure,
  MutableState,
  once,
  toClosure,
  useClearable,
  useDefaults,
  useMap,
} from 'stative';

import type { EffectItem, FluxdownRef, StreamingConfig } from '../types';

import { Fluxdown } from '..';
import styles from '../../../react-presets/src/render/shad/renderer/index.module.scss';

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

  jest.useRealTimers();
});

describe('Fluxdown streaming effects', () => {
  test.each<{ effect: StreamingConfig['effect'] }>([
    { effect: undefined },
    { effect: false },
    { effect: [] },
  ])('leaves effects disabled with effect=$effect', ({ effect }) => {
    const view = render(<Fluxdown streaming={{ smooth: false, effect }} text="a" />);

    view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="abc" />);

    expect(view.container.textContent).toBe('abc');

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();
  });

  test('updates shorthand and tuple effects while preserving the core and the active tail', () => {
    jest.useFakeTimers();

    const ref = createRef<FluxdownRef>();

    const view = render(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: 'shad' }} text="a" />,
    );

    const core = ref.current;

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: 'shad' }} text="abcdef" />,
    );

    const active = view.container.querySelector(`.${styles.active}`);

    expect(active).toHaveTextContent('bcdef');

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ smooth: false, effect: ['shad', { maskWidth: 24 }] }}
        text="abcdef"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toBe(active);

    expect(active).toHaveTextContent('bcdef');

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      width: '24px',
      marginLeft: '-24px',
    });

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ smooth: false, effect: ['shad', { length: 2, maskWidth: 24 }] }}
        text="abcdef"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('ef');

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: false }} text="abcdef" />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    expect(ref.current).toBe(core);
  });

  test('enables the default effect with true and disables it with false', async () => {
    const view = render(<Fluxdown streaming={{ smooth: false, effect: true }} text="abc" />);

    expect(view.container.querySelector(`.${styles.active}`)).not.toBeNull();

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: false }} text="abc" />);

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: true }} text="abc" />);

    await waitFor(() => expect(view.container.querySelector(`.${styles.active}`)).not.toBeNull());
  });

  test('enables named effects when their optional enabled value is undefined', () => {
    const view = render(
      <Fluxdown
        streaming={{ smooth: false, effect: ['shad', { enabled: undefined }] }}
        text="abc"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).not.toBeNull();
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

    const Observe = once(({ source }: MapperInputs) => {
      const shaded = source.value.value.some((block) =>
        block.value.value.children.some(
          (node) =>
            'children' in node &&
            node.children.some(
              (child) =>
                child.type === 'element' && child.properties[SHAD_DATA_ATTR] === SHAD_HOST_VALUE,
            ),
        ),
      );

      observed(shaded);

      return source;
    });

    const view = render(
      <Fluxdown streaming={{ smooth: false, effect: [Observe, 'shad'] }} text="abc" />,
    );

    expect(observed).toHaveBeenLastCalledWith(false);

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: ['shad', Observe] }} text="abc" />);

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

    const view = render(
      <Fluxdown streaming={{ smooth: false, effect: [Shad, { enabled: active }] }} text="abc" />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).not.toBeNull();

    act(() => enabled.next(false));

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    enabled.destroy();
  });
});
