import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { ChunkRenderer } from '..';

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();
});

test('resumes zero-origin batches using monotonic time without reading the wall clock', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(50);

  const wallClock = vi.spyOn(Date, 'now').mockReturnValue(-1);

  const children = createRawSnippet(() => ({ render: () => '<span>chunk</span>' }));

  const first = render(ChunkRenderer, { children, start: 0, duration: 400 });

  const batch = first.container.querySelector('[data-fluxdown-chunk]') as HTMLElement;

  expect(batch.classList.contains('active')).toBe(true);

  expect(batch.style.animationDelay).toBe('-50ms');

  first.unmount();

  now.mockReturnValue(600);

  wallClock.mockReturnValue(1_000_000);

  const completed = render(ChunkRenderer, { children, start: 0, duration: 400 });

  expect(completed.container.querySelector('.active')).toBeNull();

  expect(wallClock).not.toHaveBeenCalled();
});

test('keeps an existing batch and replaces only a new arrival', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(50);

  const children = createRawSnippet(() => ({ render: () => '<span>chunk</span>' }));

  const view = render(ChunkRenderer, { children, start: 0, duration: 400 });

  const batch = view.container.querySelector('[data-fluxdown-chunk]') as HTMLElement;

  now.mockReturnValue(100);

  await view.rerender({ duration: 500 });

  expect(view.container.querySelector('[data-fluxdown-chunk]')).toBe(batch);

  expect(batch.style.animationDelay).toBe('-50ms');

  await view.rerender({ start: 100 });

  const next = view.container.querySelector('[data-fluxdown-chunk]') as HTMLElement;

  expect(next).not.toBe(batch);

  expect(next.style.animationDelay).toBe('0ms');
});

test('does not read the clock for static batches', () => {
  const now = vi.spyOn(performance, 'now');

  const view = render(ChunkRenderer, { start: -1, duration: 400 });

  expect(view.container.querySelector('.active')).toBeNull();

  expect(now).not.toHaveBeenCalled();
});
