import { act, cleanup, render } from '@testing-library/react';
import { createRef, StrictMode } from 'react';

import type { FluxdownRef } from '../types';

import { Fluxdown } from '..';
import { restoreGlobals } from '../../../../scripts/testing/globals';
import { createRafClock } from './utils/raf';
import { createManualTicker, createStepScheduler } from './utils/smooth';

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  restoreGlobals();
});

describe('Fluxdown smooth streaming', () => {
  test('waits for new content before constructing a ticker, including StrictMode replay', async () => {
    const ticker = createManualTicker();

    const smooth = {
      enabled: true,
      ticker: ticker.Ticker,
      scheduler: createStepScheduler(1),
    };

    const view = render(
      <StrictMode>
        <Fluxdown streaming={{ smooth, shad: false }} text="abc" />
      </StrictMode>,
    );

    expect(view.container.textContent).toBe('abc');

    expect(ticker.instances).toHaveLength(0);

    view.rerender(
      <StrictMode>
        <Fluxdown streaming={{ smooth, shad: false }} text="abcd" />
      </StrictMode>,
    );

    expect(view.container.textContent).toBe('abc');

    expect(ticker.instances).toHaveLength(1);

    await act(async () => ticker.current().tick(16));

    expect(view.container.textContent).toBe('abcd');

    view.unmount();

    await act(async () => {});

    expect(ticker.current().running).toBe(false);

    expect(ticker.current().destroyCalls).toBe(1);
  });

  test('renders immediately by default and when an options object omits enabled', () => {
    const clock = createRafClock();

    const view = render(<Fluxdown text="" />);

    view.rerender(<Fluxdown text="default stream" />);

    expect(view.container).toHaveTextContent('default stream');

    view.rerender(
      <Fluxdown
        streaming={{ smooth: { scheduler: 'spring', ticker: 'raf' }, shad: false }}
        text="object stream"
      />,
    );

    expect(view.container).toHaveTextContent('object stream');

    expect(clock.request).not.toHaveBeenCalled();
  });

  test('shows initial content immediately and reveals an appended suffix across frames', async () => {
    const clock = createRafClock();

    const view = render(<Fluxdown streaming={{ smooth: true, shad: false }} text="abc" />);

    expect(view.container).toHaveTextContent('abc');

    view.rerender(<Fluxdown streaming={{ smooth: true, shad: false }} text="abcdef" />);

    expect(view.container.textContent).toBe('abc');

    await clock.advanceUntil(() => view.container.textContent === 'abcdef');

    expect(clock.request).toHaveBeenCalled();
  });

  test('enables smoothing dynamically, flushes on disable, and resumes from visible content', async () => {
    const clock = createRafClock();

    const ref = createRef<FluxdownRef>();

    const view = render(<Fluxdown ref={ref} text="abc" />);

    const closure = ref.current;

    view.rerender(<Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="abc" />);

    view.rerender(<Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="abcdef" />);

    expect(view.container.textContent).toBe('abc');

    view.rerender(<Fluxdown ref={ref} streaming={false} text="abcdef" />);

    expect(view.container.textContent).toBe('abcdef');

    expect(clock.pending.size).toBe(0);

    view.rerender(<Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="abcdef" />);

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="abcdefghi" />,
    );

    expect(view.container.textContent).toBe('abcdef');

    await clock.advanceUntil(() => view.container.textContent === 'abcdefghi');

    expect(ref.current).toBe(closure);
  });

  test('reveals compiled emphasis without displaying Markdown delimiters', async () => {
    const clock = createRafClock();

    const view = render(<Fluxdown streaming={{ smooth: true, shad: false }} text="" />);

    view.rerender(<Fluxdown streaming={{ smooth: true, shad: false }} text="**alphabet**" />);

    expect(view.container.textContent).toBe('');

    await clock.advanceUntil(() => (view.container.textContent?.length ?? 0) > 0);

    expect(view.container.querySelector('strong')).not.toBeNull();

    expect(view.container.textContent).not.toContain('*');

    await clock.advanceUntil(() => view.container.textContent === 'alphabet');

    expect(view.container.querySelector('strong')).toHaveTextContent('alphabet');

    expect(view.container.textContent).not.toContain('*');
  });

  test('keeps completed blocks and the growing paragraph mounted across ticks', async () => {
    const clock = createRafClock();

    const view = render(<Fluxdown streaming={{ smooth: true, shad: false }} text="first" />);

    const firstParagraph = view.container.querySelector('p');

    view.rerender(<Fluxdown streaming={{ smooth: true, shad: false }} text={'first\n\nsecond'} />);

    expect(view.container.textContent).toBe('first');

    await clock.advanceUntil(() => view.container.querySelectorAll('p').length === 2);

    const growingParagraph = view.container.querySelectorAll('p').item(1);

    await clock.advanceUntil(() => view.container.textContent === 'firstsecond');

    expect(view.container.querySelector('p')).toBe(firstParagraph);

    expect(view.container.querySelectorAll('p').item(1)).toBe(growingParagraph);

    view.rerender(
      <Fluxdown streaming={{ smooth: true, shad: false }} text={'first\n\nsecond plus'} />,
    );

    expect(view.container.textContent).toBe('firstsecond');

    await clock.advanceUntil(() => view.container.textContent === 'firstsecond plus');

    expect(view.container.querySelector('p')).toBe(firstParagraph);

    expect(view.container.querySelectorAll('p').item(1)).toBe(growingParagraph);
  });

  test('cancels pending animation work and closes the committed core on unmount', async () => {
    const clock = createRafClock();

    const ref = createRef<FluxdownRef>();

    const view = render(
      <Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="first" />,
    );

    const closure = ref.current;

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ smooth: true, shad: false }}
        text="first with a pending suffix"
      />,
    );

    expect(clock.pending.size).toBeGreaterThan(0);

    view.unmount();

    await act(async () => {});

    expect(clock.pending.size).toBe(0);

    expect(clock.cancel).toHaveBeenCalled();

    expect(closure?.value.closed).toBe(true);

    await clock.step();

    expect(clock.pending.size).toBe(0);
  });

  test('survives StrictMode replay and leaves no animation work after final unmount', async () => {
    const clock = createRafClock();

    const ref = createRef<FluxdownRef>();

    const view = render(
      <StrictMode>
        <Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="first" />
      </StrictMode>,
    );

    const closure = ref.current;

    view.rerender(
      <StrictMode>
        <Fluxdown ref={ref} streaming={{ smooth: true, shad: false }} text="first second" />
      </StrictMode>,
    );

    expect(view.container.textContent).toBe('first');

    await clock.advanceUntil(() => view.container.textContent === 'first second');

    expect(ref.current).toBe(closure);

    view.unmount();

    await act(async () => {});

    expect(clock.pending.size).toBe(0);

    expect(closure?.value.closed).toBe(true);
  });

  test('applies build changes to existing text while smoothing is enabled', async () => {
    const clock = createRafClock();

    const view = render(
      <Fluxdown build={{ tex: false }} streaming={{ smooth: true, shad: false }} text="$x$" />,
    );

    expect(view.container.textContent).toBe('$x$');

    view.rerender(
      <Fluxdown build={{ tex: true }} streaming={{ smooth: true, shad: false }} text="$x$" />,
    );

    await clock.advanceUntil(() => view.container.textContent === 'x');

    view.rerender(<Fluxdown build={{ tex: false }} streaming={false} text="$x$" />);

    expect(view.container.textContent).toBe('$x$');
  });

  test('switches custom tickers without losing visible progress and releases the old ticker', async () => {
    const first = createManualTicker();

    const second = createManualTicker();

    const Scheduler = createStepScheduler(1);

    const options = (ticker: typeof first.Ticker) => ({
      enabled: true,
      ticker,
      scheduler: Scheduler,
    });

    const view = render(
      <Fluxdown streaming={{ smooth: options(first.Ticker), shad: false }} text="abc" />,
    );

    view.rerender(
      <Fluxdown streaming={{ smooth: options(first.Ticker), shad: false }} text="abcdef" />,
    );

    await act(async () => first.current().tick(16));

    expect(view.container.textContent).toBe('abcd');

    view.rerender(
      <Fluxdown streaming={{ smooth: options(second.Ticker), shad: false }} text="abcdef" />,
    );

    expect(view.container.textContent).toBe('abcd');

    expect(first.current().running).toBe(false);

    expect(first.current().destroyCalls).toBe(1);

    await act(async () => first.current().tick(32));

    expect(view.container.textContent).toBe('abcd');

    await act(async () => second.current().tick(32));

    expect(view.container.textContent).toBe('abcde');

    view.unmount();

    await act(async () => {});

    expect(second.current().running).toBe(false);

    expect(second.current().destroyCalls).toBe(1);
  });

  test('applies a changed custom scheduler to the remaining suffix', async () => {
    const ticker = createManualTicker();

    const SlowScheduler = createStepScheduler(1);

    const FastScheduler = createStepScheduler(2);

    const options = (scheduler: typeof SlowScheduler) => ({
      enabled: true,
      ticker: ticker.Ticker,
      scheduler,
    });

    const view = render(
      <Fluxdown streaming={{ smooth: options(SlowScheduler), shad: false }} text="abc" />,
    );

    view.rerender(
      <Fluxdown streaming={{ smooth: options(SlowScheduler), shad: false }} text="abcdefgh" />,
    );

    await act(async () => ticker.current().tick(16));

    expect(view.container.textContent).toBe('abcd');

    view.rerender(
      <Fluxdown streaming={{ smooth: options(FastScheduler), shad: false }} text="abcdefgh" />,
    );

    expect(view.container.textContent).toBe('abcd');

    await act(async () => ticker.current().tick(32));

    expect(view.container.textContent).toBe('abcdef');

    await act(async () => ticker.current().tick(48));

    expect(view.container.textContent).toBe('abcdefgh');
  });
});
