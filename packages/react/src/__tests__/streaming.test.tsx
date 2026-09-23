import { act, cleanup, render } from '@testing-library/react';
import { createRef } from 'react';

import type { FluxdownProps, FluxdownRef } from '../types';

import { Fluxdown } from '..';
import { restoreGlobals } from '../../../../scripts/testing/globals';
import styles from '../../../react-presets/src/render/shad/renderer/index.module.scss';
import { createRafClock } from './utils/raf';

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  restoreGlobals();
});

describe('Fluxdown streaming options', () => {
  test.each<{ streaming: FluxdownProps['streaming']; repaired: boolean }>([
    { streaming: undefined, repaired: false },
    { streaming: false, repaired: false },
    { streaming: true, repaired: true },
    { streaming: {}, repaired: true },
    { streaming: { repairEnding: false }, repaired: false },
    { streaming: { smooth: false, shad: false }, repaired: true },
  ])('repairs incomplete endings with streaming=$streaming', ({ streaming, repaired }) => {
    const view = render(<Fluxdown streaming={streaming} text="**ending" />);

    expect(view.container.querySelector('strong') !== null).toBe(repaired);

    expect(view.container.textContent).toBe(repaired ? 'ending' : '**ending');
  });

  test('enables smoothing, fading, and ending repairs together with boolean streaming', async () => {
    const clock = createRafClock();

    const view = render(<Fluxdown streaming text="" />);

    view.rerender(<Fluxdown streaming text="**ending" />);

    expect(view.container.textContent).toBe('');

    await clock.advanceUntil(() => (view.container.textContent?.length ?? 0) > 0);

    expect(view.container.querySelector('strong')).not.toBeNull();

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent(/\S/);

    expect(view.container.querySelector(`.${styles.mask}`)).not.toBeNull();

    view.rerender(<Fluxdown streaming={false} text="**ending" />);

    expect(view.container.textContent).toBe('**ending');

    expect(view.container.querySelector('strong')).toBeNull();

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    expect(clock.pending.size).toBe(0);
  });

  test('updates ending repairs for existing text without replacing the core', () => {
    const ref = createRef<FluxdownRef>();

    const streaming = { smooth: false, shad: false };

    const view = render(<Fluxdown ref={ref} streaming={streaming} text="**ending" />);

    const core = ref.current;

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    view.rerender(
      <Fluxdown ref={ref} streaming={{ ...streaming, repairEnding: false }} text="**ending" />,
    );

    expect(view.container.textContent).toBe('**ending');

    expect(view.container.querySelector('strong')).toBeNull();

    view.rerender(<Fluxdown ref={ref} streaming={streaming} text="**ending" />);

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    expect(ref.current).toBe(core);
  });

  test('honors an explicit repair override and restores streaming defaults when it is removed', () => {
    const streaming = { smooth: false, shad: false };

    const view = render(<Fluxdown streaming={streaming} text="**ending" />);

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    view.rerender(<Fluxdown build={{ repair: false }} streaming={streaming} text="**ending" />);

    expect(view.container.textContent).toBe('**ending');

    expect(view.container.querySelector('strong')).toBeNull();

    view.rerender(<Fluxdown streaming={streaming} text="**ending" />);

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    view.rerender(<Fluxdown build={{ repair: true }} streaming={false} text="**ending" />);

    expect(view.container.textContent).toBe('**ending');

    expect(view.container.querySelector('strong')).toBeNull();
  });
});
