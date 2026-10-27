import type { ISvelteRenderPluggable } from '@fluxdown/svelte-plugins/base';

import { cleanup, render } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';

import { Fluxdown } from '../packs/full';

interface LifecycleCounts {
  created: number;

  destroyed: number;
}

const createTrackedRenderPlugin = (
  key: string,
  counts: LifecycleCounts,
): ISvelteRenderPluggable => {
  return class TrackedRenderPlugin {
    static readonly key = key;

    readonly config = {};

    constructor() {
      counts.created += 1;
    }

    match() {
      return false;
    }

    render() {
      return null;
    }

    destroy() {
      counts.destroyed += 1;
    }
  };
};

afterEach(cleanup);

test('reuses plugins across rebuilt and reordered arrays and retires each instance once', async () => {
  const first: LifecycleCounts = { created: 0, destroyed: 0 };

  const second: LifecycleCounts = { created: 0, destroyed: 0 };

  const FirstPlugin = createTrackedRenderPlugin('lifecycle-first', first);

  const SecondPlugin = createTrackedRenderPlugin('lifecycle-second', second);

  const view = render(Fluxdown, {
    text: 'lifecycle',
    plugins: [{ renders: [FirstPlugin, SecondPlugin] }],
  });

  expect(first).toEqual({ created: 1, destroyed: 0 });

  expect(second).toEqual({ created: 1, destroyed: 0 });

  await view.rerender({ plugins: [{ renders: [FirstPlugin, SecondPlugin] }] });

  await view.rerender({ plugins: [{ renders: [SecondPlugin, FirstPlugin] }] });

  expect(first).toEqual({ created: 1, destroyed: 0 });

  expect(second).toEqual({ created: 1, destroyed: 0 });

  await view.rerender({ plugins: [{ renders: [SecondPlugin] }] });

  expect(first).toEqual({ created: 1, destroyed: 1 });

  expect(second).toEqual({ created: 1, destroyed: 0 });

  view.unmount();

  expect(first).toEqual({ created: 1, destroyed: 1 });

  expect(second).toEqual({ created: 1, destroyed: 1 });
});

test('reuses tuple plugins for equal options and replaces changed options', async () => {
  const counts: LifecycleCounts = { created: 0, destroyed: 0 };

  const received: unknown[] = [];

  class ConfiguredRenderPlugin {
    static readonly key = 'lifecycle-configured';

    readonly config = {};

    constructor(options: unknown = {}) {
      counts.created += 1;

      received.push(options);
    }

    match() {
      return false;
    }

    render() {
      return null;
    }

    destroy() {
      counts.destroyed += 1;
    }
  }

  const configured = (label: string): ISvelteRenderPluggable => {
    return [ConfiguredRenderPlugin, { label, nested: { enabled: true } }];
  };

  const view = render(Fluxdown, {
    text: 'configured',
    plugins: [{ renders: [configured('same')] }],
  });

  expect(counts).toEqual({ created: 1, destroyed: 0 });

  await view.rerender({ plugins: [{ renders: [configured('same')] }] });

  expect(counts).toEqual({ created: 1, destroyed: 0 });

  await view.rerender({ plugins: [{ renders: [configured('changed')] }] });

  expect(counts).toEqual({ created: 2, destroyed: 1 });

  expect(received).toEqual([
    { label: 'same', nested: { enabled: true } },
    { label: 'changed', nested: { enabled: true } },
  ]);

  view.unmount();

  expect(counts).toEqual({ created: 2, destroyed: 2 });
});
