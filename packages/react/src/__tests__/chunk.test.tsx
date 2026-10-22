import { Chunk } from '@fluxdown/core-presets/plugins/mapper/chunk';
import { PREFIX } from '@fluxdown/react-presets/base';
import { act, cleanup, render } from '@testing-library/react';
import { MutableState, toClosure } from 'stative';

import type { EffectItem } from '../packs/full';

import styles from '../../../react-presets/src/plugins/effect-chunk/render/effect-chunk/renderer/index.module.scss';
import { Fluxdown } from '../packs/full';
import { createManualTicker, createStepScheduler } from './utils/smooth';

const selector = '[data-fluxdown-chunk]';
const streaming = { smooth: false, effect: 'chunk' as const };

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  jest.spyOn(performance, 'now').mockReturnValue(1000);
});

afterEach(async () => {
  cleanup();
  await act(async () => {});
  jest.restoreAllMocks();

  jest.useRealTimers();
});

test('animates each append as one inline batch and retains existing elements', () => {
  const view = render(<Fluxdown streaming={streaming} text="Hello" />);
  expect(view.container.querySelector(selector)).toBeNull();

  view.rerender(<Fluxdown streaming={streaming} text="Hello world" />);
  const chunk = view.container.querySelector(selector);

  expect(chunk?.textContent).toBe(' world');
  expect(chunk).toHaveStyle({ [`--${PREFIX}-chunk-duration`]: '400ms', animationDelay: '0ms' });
  expect(view.container.querySelectorAll(selector)).toHaveLength(1);

  jest.mocked(performance.now).mockReturnValue(1100);
  view.rerender(<Fluxdown streaming={streaming} text="Hello world! Another chunk." />);

  expect(view.container.querySelector(selector)).toBe(chunk);
  expect(Array.from(view.container.querySelectorAll(selector), (node) => node.textContent)).toEqual(
    [' world', '! Another chunk.'],
  );
  expect(view.container.textContent).toBe('Hello world! Another chunk.');
  expect(jest.getTimerCount()).toBe(0);
});

test('resumes the same entrance after reparsing regardless of wall-clock changes', () => {
  const view = render(<Fluxdown streaming={streaming} text="" />);
  view.rerender(<Fluxdown streaming={streaming} text="hello" />);

  jest.mocked(performance.now).mockReturnValue(1100);
  jest.setSystemTime(-1_000_000);
  view.rerender(<Fluxdown streaming={streaming} text="**hello**" />);
  expect(view.container.querySelector('strong')).toHaveTextContent('hello');
  expect(view.container.querySelector(selector)).toHaveStyle({ animationDelay: '-100ms' });

  jest.mocked(performance.now).mockReturnValue(1500);
  jest.setSystemTime(5_000_000_000);
  view.rerender(<Fluxdown streaming={streaming} text="**hello** next" />);
  expect(view.container.querySelector('strong')?.querySelector(selector)).toBeNull();
  expect(Array.from(view.container.querySelectorAll(selector), (node) => node.textContent)).toEqual(
    [' next'],
  );
});

test('preserves completed block identity and timestamps new Unicode content as a batch', () => {
  const view = render(<Fluxdown streaming={streaming} text="first" />);
  const first = view.container.querySelector('p');
  view.rerender(<Fluxdown streaming={streaming} text={'first\n\n👨‍👩‍👧‍👦 e\u0301 中文'} />);

  expect(view.container.querySelector('p')).toBe(first);
  expect(first?.querySelector(selector)).toBeNull();
  expect(Array.from(view.container.querySelectorAll(selector), (node) => node.textContent)).toEqual(
    ['👨‍👩‍👧‍👦 e\u0301 中文'],
  );
});

test('groups newly revealed Smooth output into each tick and cleans up its ticker', async () => {
  const ticker = createManualTicker();
  const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(2) };
  const view = render(<Fluxdown streaming={{ smooth, effect: 'chunk' }} text="first" />);
  view.rerender(<Fluxdown streaming={{ smooth, effect: 'chunk' }} text={'first\n\n**second**'} />);

  act(() => ticker.current().tick(16));
  const chunk = view.container.querySelector(selector);
  expect(chunk).toHaveTextContent('se');
  expect(view.container.querySelectorAll(selector)).toHaveLength(1);

  jest.mocked(performance.now).mockReturnValue(1016);
  act(() => ticker.current().tick(32));
  expect(view.container.querySelector(selector)).toBe(chunk);
  expect(Array.from(view.container.querySelectorAll(selector), (node) => node.textContent)).toEqual(
    ['se', 'co'],
  );

  const instance = ticker.current();
  view.unmount();
  await act(async () => {});
  expect(instance.destroyCalls).toBe(1);
});

test('uses new duration for later chunks and re-enables from settled content', () => {
  const duration = MutableState.of(400);
  const enabled = MutableState.of(true);
  const effect: EffectItem = [
    Chunk,
    { duration: toClosure(duration), enabled: toClosure(enabled) },
  ];
  const view = render(<Fluxdown streaming={{ smooth: false, effect }} text="a" />);
  view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="ab" />);
  const chunk = view.container.querySelector(selector);

  act(() => duration.next(600));
  expect(view.container.querySelector(selector)).toBe(chunk);
  expect(chunk).toHaveStyle({ [`--${PREFIX}-chunk-duration`]: '400ms' });

  jest.mocked(performance.now).mockReturnValue(1100);
  view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="abc" />);
  expect(view.container.querySelectorAll(selector)[1]).toHaveStyle({
    [`--${PREFIX}-chunk-duration`]: '600ms',
  });

  act(() => enabled.next(false));
  expect(view.container.querySelector(selector)).toBeNull();
  act(() => enabled.next(true));
  expect(view.container.querySelector(selector)).toBeNull();
  view.rerender(<Fluxdown streaming={{ smooth: false, effect }} text="abcd" />);
  expect(view.container.querySelector(selector)).toHaveTextContent('d');

  view.unmount();
  expect(enabled.closed).toBe(false);
  expect(duration.closed).toBe(false);
  enabled.destroy();
  duration.destroy();
});

test('resets removed chunks when the response is cleared or replaced', () => {
  const view = render(<Fluxdown streaming={streaming} text="" />);
  view.rerender(<Fluxdown streaming={streaming} text="abc" />);
  jest.mocked(performance.now).mockReturnValue(1100);
  view.rerender(<Fluxdown streaming={streaming} text="axc" />);

  expect(view.container.textContent).toBe('axc');
  expect(Array.from(view.container.querySelectorAll(selector), (node) => node.textContent)).toEqual(
    ['a', 'x', 'c'],
  );

  view.rerender(<Fluxdown streaming={streaming} text="" />);
  expect(view.container.querySelector(selector)).toBeNull();
  jest.mocked(performance.now).mockReturnValue(1200);
  view.rerender(<Fluxdown streaming={streaming} text="a" />);
  expect(view.container.querySelector(selector)).toHaveClass(styles.active);
  expect(view.container.querySelector(selector)).toHaveStyle({ animationDelay: '0ms' });
});

test('keeps inline code opaque', () => {
  const view = render(<Fluxdown streaming={streaming} text="" />);
  view.rerender(<Fluxdown streaming={streaming} text="hello `code`" />);
  expect(view.container.querySelector('code')).toHaveTextContent('code');
  expect(view.container.querySelector('code')?.querySelector(selector)).toBeNull();

  expect(jest.getTimerCount()).toBe(0);
});
