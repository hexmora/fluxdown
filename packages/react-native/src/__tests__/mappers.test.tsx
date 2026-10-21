import type { MapperInputs, MapperPluggable } from '@fluxdown/core';
import type { MapperConfigInputs as ConfigInputs, MapperPluginConfig } from '@fluxdown/types';

import { Shad, Smooth } from '@fluxdown/core-presets/mapper';
import { act, cleanup, render, waitFor } from '@testing-library/react-native';
import { first, reverse } from 'lodash-es';
import { createRef, StrictMode } from 'react';
import {
  type IReadableClosure,
  MutableState,
  once,
  ReactiveState,
  toClosure,
  useClearable,
  useDefaults,
  useMap,
} from 'stative';

import type { FluxdownRef, IPluginItem } from '../types';

import { Fluxdown } from '..';
import { textContent } from './utils/native';
import { createManualTicker, createStepScheduler } from './utils/smooth';

declare global {
  interface MapperConfigs {
    configured: MapperPluginConfig<{ count?: number }>;
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
});

describe('Fluxdown mapper plugins', () => {
  test('overrides Smooth tuples while retaining explicit mapper effects', () => {
    const ticker = createManualTicker();

    const scheduler = createStepScheduler(1);

    const mappers: MapperPluggable[] = [
      [
        Smooth,
        {
          enabled: toClosure(ReactiveState.of(true)),
          ticker: toClosure(ReactiveState.of(ticker.Ticker)),
          scheduler: toClosure(ReactiveState.of(scheduler)),
        },
      ],
      [
        Shad,
        { enabled: toClosure(ReactiveState.of(true)), length: toClosure(ReactiveState.of(2)) },
      ],
    ];

    const content = (text: string) => <Fluxdown text={text} plugins={[{ mappers }]} />;

    const view = render(content('a'));

    view.rerender(content('abc'));

    expect(textContent(view.toJSON())).toBe('abc');

    expect(view.getByText('bc')).toBeTruthy();

    expect(ticker.instances).toHaveLength(0);
  });

  test('applies keyed pack config and rebinds distinct readable config values', async () => {
    const state = MutableState.of(1);

    const destroy = jest.fn();

    const left = { value: state, destroy };

    const right = { value: state, destroy };

    const received = jest.fn();

    const Configured = Object.assign(
      once(function Configured({ source, count }: MapperInputs<ConfigInputs<{ count?: number }>>) {
        received(count);

        const limit = useDefaults(count, 1);

        return useMap([source, limit], ([blocks, size]) => blocks.slice(0, size));
      }),
      { key: 'configured' },
    );

    const content = (count: IReadableClosure<number>) => (
      <Fluxdown
        text={'first\n\nsecond'}
        plugins={[{ config: { configured: { count } }, mappers: [Configured] }]}
      />
    );

    const view = render(content(left));

    expect(textContent(view.toJSON())).toBe('first');

    expect(received).toHaveBeenCalledTimes(1);

    const input = received.mock.calls[0]?.[0];

    expect(input).not.toBe(left);

    view.rerender(content(right));

    expect(received).toHaveBeenCalledTimes(1);

    act(() => state.next(2));

    expect(textContent(view.toJSON())).toBe('firstsecond');

    view.unmount();

    await act(async () => {});

    state.destroy();
  });

  test('updates tuple config, pack order, and mapper membership without replacing Core', async () => {
    const ref = createRef<FluxdownRef>();

    const packs = (count: number): IPluginItem[] => [
      { mappers: [Reverse] },
      { mappers: [[Limit, { count }]] },
    ];

    const view = render(
      <Fluxdown ref={ref} text={'first\n\nsecond\n\nthird'} plugins={packs(1)} />,
    );

    const core = ref.current;

    expect(textContent(view.toJSON())).toBe('third');

    view.rerender(<Fluxdown ref={ref} text={'first\n\nsecond\n\nthird'} plugins={packs(2)} />);

    await waitFor(() => expect(textContent(view.toJSON())).toBe('thirdsecond'));

    view.rerender(
      <Fluxdown ref={ref} text={'first\n\nsecond\n\nthird'} plugins={reverse(packs(2))} />,
    );

    await waitFor(() => expect(textContent(view.toJSON())).toBe('secondfirst'));

    view.rerender(<Fluxdown ref={ref} text={'first\n\nsecond\n\nthird'} plugins={[]} />);

    await waitFor(() => expect(textContent(view.toJSON())).toBe('firstsecondthird'));

    expect(ref.current).toBe(core);
  });

  test('reuses and releases dynamically added mappers through StrictMode updates', async () => {
    const created = jest.fn();

    const destroyed = jest.fn();

    const Tracked = once(({ source, count }: MapperInputs<ConfigInputs<{ count: number }>>) => {
      created(count);

      useClearable(() => destroyed(count));

      return useMap([source, count], ([blocks, limit]) => blocks.slice(0, limit));
    });

    const content = (count: number) => (
      <StrictMode>
        <Fluxdown text={'first\n\nsecond'} plugins={[{ mappers: [[Tracked, { count }]] }]} />
      </StrictMode>
    );

    const view = render(
      <StrictMode>
        <Fluxdown text={'first\n\nsecond'} />
      </StrictMode>,
    );

    view.rerender(content(1));

    await act(async () => {});

    const activeCount = created.mock.calls.length - destroyed.mock.calls.length;

    const initialCreates = created.mock.calls.length;

    expect(activeCount).toBe(1);

    view.rerender(content(1));

    expect(created).toHaveBeenCalledTimes(initialCreates);

    view.rerender(content(2));

    await waitFor(() => expect(textContent(view.toJSON())).toBe('firstsecond'));

    expect(created.mock.calls.length - destroyed.mock.calls.length).toBe(1);

    view.rerender(
      <StrictMode>
        <Fluxdown text="removed" />
      </StrictMode>,
    );

    await waitFor(() => expect(destroyed).toHaveBeenCalledTimes(created.mock.calls.length));

    view.rerender(content(1));

    view.unmount();

    await waitFor(() => expect(destroyed).toHaveBeenCalledTimes(created.mock.calls.length));
  });

  test('keeps Smooth progress and ticker when appending or removing a mapper', async () => {
    const ticker = createManualTicker();

    const scheduler = createStepScheduler(1);

    const smooth = { enabled: true, ticker: ticker.Ticker, scheduler };

    const renderContent = (text: string, mappers: MapperPluggable[] = []) => (
      <Fluxdown streaming={{ smooth, effect: false }} text={text} plugins={[{ mappers }]} />
    );

    const view = render(renderContent('a'));

    view.rerender(renderContent('abcd'));

    act(() => ticker.current().tick(16));

    expect(textContent(view.toJSON())).toBe('ab');

    const original = ticker.current();

    view.rerender(renderContent('abcd', [Reverse]));

    await waitFor(() => expect(textContent(view.toJSON())).toBe('ab'));

    act(() => ticker.current().tick(32));

    expect(textContent(view.toJSON())).toBe('abc');

    view.rerender(renderContent('abcd'));

    act(() => ticker.current().tick(48));

    expect(textContent(view.toJSON())).toBe('abcd');

    expect(ticker.instances).toHaveLength(1);

    expect(first(ticker.instances)).toBe(original);

    view.unmount();

    await waitFor(() => expect(original.destroyCalls).toBe(1));
  });
});
