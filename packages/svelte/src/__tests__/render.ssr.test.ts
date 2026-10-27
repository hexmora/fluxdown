import { render } from 'svelte/server';
import { afterEach, expect, test, vi } from 'vitest';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

afterEach(() => {
  vi.restoreAllMocks();

  vi.useRealTimers();
});

test.each([
  { name: 'full', Component: Fluxdown },
  { name: 'lite', Component: FluxdownLite },
])('$name renders Markdown synchronously on the server', ({ Component }) => {
  const { body } = render(Component, { props: { text: '# Server heading\n\n**content**' } });

  expect(body).toMatch(/<h1[^>]*>[\s\S]*?Server heading[\s\S]*?<\/h1>/);

  expect(body).toMatch(/<strong[^>]*>[\s\S]*?content[\s\S]*?<\/strong>/);

  expect(body).toContain('--fluxdown-typography-font-size-md');
});

test.each(['chunk', 'scale', 'shad', 'suffix'] as const)(
  'renders complete %s content without starting timers or entry animations',
  (effect) => {
    vi.useFakeTimers();

    const timers = vi.getTimerCount();

    const { body } = render(FluxdownLite, {
      props: { text: 'Server content', streaming: { effect } },
    });

    expect(body.replace(/<[^>]*>/g, '')).toContain('Server content');

    expect(body).not.toMatch(/class="[^"]*effect-(?:chunk|scale)[^"]*\bactive\b/);

    expect(vi.getTimerCount()).toBe(timers);
  },
);

test('does not share request plugin instances and destroys each server render', () => {
  const created = vi.fn();

  const destroyed = vi.fn();

  class ServerRenderPlugin {
    static readonly key = 'server-lifecycle';

    readonly config = {};

    constructor() {
      created();
    }

    match() {
      return true;
    }

    render() {
      return 'server';
    }

    destroy() {
      destroyed();
    }
  }

  const props = { text: 'source', plugins: { renders: [ServerRenderPlugin] } };

  expect(render(FluxdownRaw, { props }).body).toContain('server');

  expect(created).toHaveBeenCalledTimes(1);

  expect(destroyed).toHaveBeenCalledTimes(1);

  expect(render(FluxdownRaw, { props }).body).toContain('server');

  expect(created).toHaveBeenCalledTimes(2);

  expect(destroyed).toHaveBeenCalledTimes(2);
});
