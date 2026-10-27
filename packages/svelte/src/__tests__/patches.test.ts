import type { IPatchItem } from '@fluxdown/core';
import type { SvelteNode } from '@fluxdown/svelte-plugins/base';
import type { IPluginItem } from '@fluxdown/svelte-plugins/typings';

import { createElement } from '@fluxdown/svelte-plugins/base';
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';

import { Fluxdown } from '../packs/full';

const createPatches = (label: string): IPatchItem<SvelteNode>[] => [
  {
    key: 'stable-range',
    range: [6, 11],
    render: (text?: string) => {
      return createElement('mark', { 'data-testid': 'replacement' }, `${label}:${text}`);
    },
  },
];

afterEach(cleanup);

test('renders point and replacement patches in source order and passes replaced text', () => {
  const view = render(Fluxdown, {
    text: 'Hello world',
    patches: [
      {
        key: 'point',
        range: 5,
        render: (text?: string) => {
          return createElement('i', { 'data-testid': 'point' }, text ?? '|');
        },
      },
      {
        key: 'replacement',
        range: [6, 11],
        render: (text?: string) => {
          return createElement('mark', { 'data-testid': 'replacement' }, text);
        },
      },
    ],
  });

  expect(screen.getByTestId('point')).toHaveTextContent('|');

  expect(screen.getByTestId('replacement')).toHaveTextContent('world');

  expect(view.container.firstElementChild).toHaveTextContent('Hello| world');
});

test('updates patch renderers without recompiling unchanged Markdown', async () => {
  let compileCount = 0;

  class CompileCounterRemarkPlugin {
    static readonly key = 'test-patch-compile-counter';

    readonly config = {};

    readonly plugin = () => () => {
      compileCount += 1;
    };

    destroy() {}
  }

  const plugins: IPluginItem[] = [{ remarks: [CompileCounterRemarkPlugin] }];

  const view = render(Fluxdown, {
    text: 'Hello world',
    patches: createPatches('first'),
    plugins,
  });

  expect(screen.getByTestId('replacement')).toHaveTextContent('first:world');

  const initialCount = compileCount;

  await view.rerender({ patches: createPatches('second') });

  expect(screen.getByTestId('replacement')).toHaveTextContent('second:world');

  expect(compileCount).toBe(initialCount);
});

test('supports keyless patches and ignores out-of-range patches without hiding content', () => {
  const view = render(Fluxdown, {
    text: 'visible',
    patches: [
      {
        range: [0, 7],
        render: (text?: string) => {
          return createElement('mark', { 'data-testid': 'keyless' }, text);
        },
      },
      {
        range: [50, 60],
        render: () => {
          return createElement('mark', { 'data-testid': 'out-of-range' }, 'hidden');
        },
      },
    ],
  });

  expect(screen.getByTestId('keyless')).toHaveTextContent('visible');

  expect(screen.queryByTestId('out-of-range')).not.toBeInTheDocument();

  expect(view.container.firstElementChild).toHaveTextContent('visible');
});
