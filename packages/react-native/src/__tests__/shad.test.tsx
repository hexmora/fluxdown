import { act, cleanup, render } from '@testing-library/react-native';
import { createRef } from 'react';
import { Animated } from 'react-native';

import type { FluxdownRef } from '../types';

import { Fluxdown } from '..';
import { ShadRenderer } from '../../../react-native-presets/src/slot/shad/renderer';
import { textContent } from './utils/native';
import { createManualTicker, createStepScheduler } from './utils/smooth';

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
});

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  jest.useRealTimers();
});

describe('Fluxdown native trailing fade', () => {
  test('uses a native opacity animation only for newly appended text', () => {
    const timing = jest.spyOn(Animated, 'timing');

    const view = render(<Fluxdown streaming={{ smooth: false, shad: true }} text="abc" />);

    expect(view.UNSAFE_getByType(ShadRenderer).props.isActive).toBe(false);

    expect(timing).not.toHaveBeenCalled();

    view.rerender(<Fluxdown streaming={{ smooth: false, shad: true }} text="abcdef" />);

    expect(textContent(view.toJSON())).toBe('abcdef');

    expect(view.UNSAFE_getByType(ShadRenderer).props.isActive).toBe(true);

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 1, useNativeDriver: true }),
    );
  });

  test('changes fade length and enablement without replacing the core', () => {
    const ref = createRef<FluxdownRef>();

    const view = render(<Fluxdown ref={ref} text="abc" />);

    const core = ref.current;

    expect(view.UNSAFE_queryByType(ShadRenderer)).toBeNull();

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, shad: { length: 2 } }} text="abc" />,
    );

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, shad: { length: 2 } }} text="abcdefgh" />,
    );

    expect(textContent(view.toJSON())).toBe('abcdefgh');

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, shad: { length: 4 } }} text="abcdefgh" />,
    );

    expect(view.UNSAFE_getByType(ShadRenderer).props.isActive).toBe(true);

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, shad: false }} text="abcdefgh" />,
    );

    expect(view.UNSAFE_queryByType(ShadRenderer)).toBeNull();

    expect(textContent(view.toJSON())).toBe('abcdefgh');

    expect(ref.current).toBe(core);
  });

  test('fades smooth tick output while preserving completed blocks', async () => {
    const ticker = createManualTicker();

    const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(2) };

    const view = render(<Fluxdown streaming={{ smooth, shad: true }} text="first" />);

    view.rerender(<Fluxdown streaming={{ smooth, shad: true }} text={'first\n\n**second**'} />);

    await act(async () => ticker.current().tick(16));

    expect(textContent(view.toJSON())).toBe('firstse');

    expect(
      view.UNSAFE_getAllByType(ShadRenderer).filter((renderer) => renderer.props.isActive),
    ).toHaveLength(1);

    await act(async () => ticker.current().tick(32));

    expect(textContent(view.toJSON())).toBe('firstseco');

    await act(async () => ticker.current().tick(48));

    expect(textContent(view.toJSON())).toBe('firstsecond');
  });
});
