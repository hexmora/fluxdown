import { cleanup, render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';

import type { FluxdownProps } from '../packs/full';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { createManualDriver, createStepInterpolator } from './utils/smooth';

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();

  vi.useRealTimers();
});

test.each<{ streaming: FluxdownProps['streaming']; repaired: boolean }>([
  { streaming: undefined, repaired: false },
  { streaming: false, repaired: false },
  { streaming: true, repaired: true },
  { streaming: {}, repaired: true },
  { streaming: { repairEnding: false }, repaired: false },
  { streaming: { smooth: false, effect: false }, repaired: true },
])('repairs incomplete endings with streaming=$streaming', ({ streaming, repaired }) => {
  const view = render(Fluxdown, { streaming, text: '**ending' });

  expect(view.container.querySelector('strong') !== null).toBe(repaired);

  expect(view.container.textContent).toBe(repaired ? 'ending' : '**ending');
});

test('updates ending repair for existing text without replacing the core', async () => {
  const view = render(Fluxdown, {
    text: '**ending',
    streaming: { smooth: false, effect: false },
  });

  const core = view.component.getCore();

  expect(view.container.querySelector('strong')).toHaveTextContent('ending');

  await view.rerender({ streaming: { repairEnding: false, smooth: false, effect: false } });

  expect(view.container.textContent).toBe('**ending');

  expect(view.container.querySelector('strong')).toBeNull();

  await view.rerender({ streaming: { smooth: false, effect: false } });

  expect(view.container.querySelector('strong')).toHaveTextContent('ending');

  expect(view.component.getCore()).toBe(core);
});

test('settles growth that enables streaming and animates only subsequent appends', async () => {
  const driver = createManualDriver();

  const smooth = {
    enabled: true,
    driver: driver.Driver,
    interpolation: createStepInterpolator(2),
  };

  const view = render(FluxdownLite, { text: 'a', streaming: false });

  await view.rerender({ text: 'abc', streaming: { smooth, effect: 'scale' } });

  expect(view.container.textContent).toBe('abc');

  expect(view.container.querySelector('.active .glyph')).toBeNull();

  expect(driver.instances).toHaveLength(0);

  await view.rerender({ text: 'abcdef' });

  expect(view.container.textContent).toBe('abc');

  flushSync(() => driver.current().tick(16));

  expect(view.container.textContent).toBe('abcde');

  expect(view.container.querySelector('.active .glyph')).not.toBeNull();
});

test('keeps scale character identity and entrance time through streamed and unrelated updates', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

  const view = render(Fluxdown, { text: 'a', streaming: { smooth: false, effect: 'scale' } });

  expect(view.container.querySelector('.glyph')).toBeNull();

  await view.rerender({ text: 'abc' });

  const glyph = view.container.querySelector('.active .glyph');

  const outer = glyph?.parentElement;

  expect(glyph?.textContent).toBe('b');

  expect(outer).toHaveClass('active');

  expect(outer).toHaveStyle({ animationDelay: '0ms' });

  now.mockReturnValue(1050);

  await view.rerender({ text: 'abcd', class: 'updated' });

  expect(view.container.querySelector('.active .glyph')).toBe(glyph);

  expect(outer).toHaveStyle({ animationDelay: '0ms' });

  expect(
    Array.from(view.container.querySelectorAll('.active .glyph'), (node) => node.textContent),
  ).toEqual(['b', 'c', 'd']);

  expect(view.container.textContent).toBe('abcd');
});

test('animates each append as one chunk without smoothing or additional timers', async () => {
  vi.useFakeTimers({ toNotFake: ['queueMicrotask'] });

  const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

  const view = render(Fluxdown, { text: 'Hello', streaming: { smooth: false, effect: 'chunk' } });

  expect(view.container.querySelector('[data-fluxdown-chunk]')).toBeNull();

  await view.rerender({ text: 'Hello world' });

  const chunk = view.container.querySelector('[data-fluxdown-chunk]');

  expect(chunk?.textContent).toBe(' world');

  expect(chunk).toHaveStyle({ '--fluxdown-chunk-duration': '400ms', animationDelay: '0ms' });

  now.mockReturnValue(1100);

  await view.rerender({ text: 'Hello world! Another chunk.' });

  expect(view.container.querySelector('[data-fluxdown-chunk]')).toBe(chunk);

  expect(
    Array.from(
      view.container.querySelectorAll('[data-fluxdown-chunk]'),
      (node) => node.textContent,
    ),
  ).toEqual([' world', '! Another chunk.']);

  expect(view.container.textContent).toBe('Hello world! Another chunk.');

  const latest = view.container.querySelectorAll('[data-fluxdown-chunk]')[1];

  now.mockReturnValue(1200);

  await view.rerender({ text: 'Hello world! Another chunk.' });

  expect(view.container.querySelectorAll('[data-fluxdown-chunk]')[1]).toBe(latest);

  expect(latest).toHaveStyle({ animationDelay: '0ms' });

  expect(vi.getTimerCount()).toBe(0);
});

test('resumes chunk entrances after reparsing without depending on wall-clock changes', async () => {
  vi.useFakeTimers({ toNotFake: ['queueMicrotask'] });

  const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

  const view = render(Fluxdown, { text: '', streaming: { smooth: false, effect: 'chunk' } });

  await view.rerender({ text: 'hello' });

  now.mockReturnValue(1100);

  vi.setSystemTime(-1_000_000);

  await view.rerender({ text: '**hello**' });

  expect(view.container.querySelector('strong')).toHaveTextContent('hello');

  expect(view.container.querySelector('[data-fluxdown-chunk]')).toHaveStyle({
    animationDelay: '-100ms',
  });

  now.mockReturnValue(1500);

  vi.setSystemTime(5_000_000_000);

  await view.rerender({ text: '**hello** next' });

  expect(view.container.querySelector('strong [data-fluxdown-chunk]')).toBeNull();

  expect(view.container.querySelector('[data-fluxdown-chunk]')?.textContent).toBe(' next');
});

test('leaves initial shad content plain and fades appended characters on their own clock', async () => {
  vi.spyOn(performance, 'now').mockReturnValue(1000);

  const view = render(Fluxdown, { text: 'abc', streaming: { smooth: false, effect: 'shad' } });

  expect(view.container.querySelector('[data-fluxdown-shad]')).toBeNull();

  await view.rerender({ text: 'abc defg' });

  expect(view.container.textContent).toBe('abc defg');

  const fades = [...view.container.querySelectorAll<HTMLElement>('[data-fluxdown-shad="fade"]')];

  expect(fades.map((item) => item.textContent).join('')).toBe(' defg');

  expect(fades.every((item) => item.classList.contains('active'))).toBe(true);

  expect(
    fades.every((item) => item.style.getPropertyValue('--fluxdown-shad-duration').endsWith('ms')),
  ).toBe(true);
});

test.each([
  ['paragraph', 'text', 'p'],
  ['strong', '**text**', 'p'],
  ['inline code', '`text`', 'p'],
  ['heading', '## text', 'h2'],
  ['list item', '- text', 'li'],
  ['code block', '```text\nconst text = 1;\n```', 'pre code'],
])('places one suffix at the end of a %s', (_name, text, parent) => {
  const view = render(FluxdownLite, { text, streaming: { smooth: false, effect: 'suffix' } });

  const marker = view.container.querySelector('[data-fluxdown-suffix]');

  expect(marker).toHaveAttribute('data-fluxdown-suffix', 'cursor');

  expect(marker?.parentElement).toBe(view.container.querySelector(parent));

  expect(view.container.querySelectorAll('[data-fluxdown-suffix]')).toHaveLength(1);

  expect(marker).toHaveAttribute('aria-hidden', 'true');

  expect(marker?.nextElementSibling).toBeNull();
});

test.each(['scale', 'shad', 'suffix'] as const)(
  'reveals smooth %s content incrementally and releases the driver',
  async (effect) => {
    const driver = createManualDriver();

    const smooth = {
      enabled: true,
      driver: driver.Driver,
      interpolation: createStepInterpolator(2),
    };

    const view = render(FluxdownLite, { text: 'first', streaming: { smooth, effect } });

    const first = view.container.querySelector('p');

    await view.rerender({ text: 'first\n\n**second**' });

    expect(view.container.textContent).toBe('first');

    flushSync(() => driver.current().tick(16));

    expect(view.container.textContent).toBe('firstse');

    expect(view.container.querySelector('strong')).toHaveTextContent('se');

    expect(view.container.querySelector('p')).toBe(first);

    flushSync(() => driver.current().tick(32));

    expect(view.container.textContent).toBe('firstseco');

    const instance = driver.current();

    await view.rerender({ streaming: false });

    expect(view.container.textContent).toBe('firstsecond');

    expect(view.container.querySelector('[data-fluxdown-suffix]')).toBeNull();

    expect(view.container.querySelector('.glyph')).toBeNull();

    expect(view.container.querySelector('.fluxdown-svelte-effect-shad')).toBeNull();

    view.unmount();

    expect(instance.destroyCalls).toBe(1);
  },
);
