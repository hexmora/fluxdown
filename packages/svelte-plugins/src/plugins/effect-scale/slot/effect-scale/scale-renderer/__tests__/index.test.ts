import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { ScaleRenderer } from '..';

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();
});

test('continues an in-flight character after remount and skips completed animation', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const wallClock = vi.spyOn(Date, 'now').mockReturnValue(-1);

  const children = createRawSnippet(() => ({ render: () => '<span>A</span>' }));

  const props = { children, start: 1000, duration: 200, from: 0, blur: 0.08 };

  const first = render(ScaleRenderer, props);

  const character = first.container.querySelector('.fluxdown-svelte-effect-scale') as HTMLElement;

  expect(character.classList.contains('active')).toBe(true);

  expect(character.style.animationDelay).toBe('-100ms');

  expect(first.container.textContent).toBe('A');

  first.unmount();

  now.mockReturnValue(1150);

  const second = render(ScaleRenderer, props);

  expect((second.container.firstElementChild as HTMLElement).style.animationDelay).toBe('-150ms');

  second.unmount();

  now.mockReturnValue(1250);

  const completed = render(ScaleRenderer, props);

  expect(completed.container.querySelector('.active')).toBeNull();

  expect(wallClock).not.toHaveBeenCalled();
});

test('retains a character during updates and only restarts a new arrival', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const children = createRawSnippet(() => ({ render: () => '<span>A</span>' }));

  const view = render(ScaleRenderer, {
    children,
    start: 1000,
    duration: 200,
    from: 0,
    blur: 0.08,
  });

  const glyph = view.container.querySelector('.glyph');

  const outer = glyph?.parentElement;

  now.mockReturnValue(1200);

  await view.rerender({ start: 1000 });

  expect(view.container.querySelector('.glyph')).toBe(glyph);

  expect(outer?.style.animationDelay).toBe('-100ms');

  await view.rerender({ start: 1200 });

  expect(view.container.querySelector('.glyph')).not.toBe(glyph);

  expect(view.container.firstElementChild).not.toBe(outer);

  expect((view.container.firstElementChild as HTMLElement).style.animationDelay).toBe('0ms');
});

test('does not read the clock for static characters', () => {
  const now = vi.spyOn(performance, 'now');

  const view = render(ScaleRenderer, { start: -1, duration: 200, from: 0, blur: 0.08 });

  expect(view.container.querySelector('.active')).toBeNull();

  expect(now).not.toHaveBeenCalled();
});
