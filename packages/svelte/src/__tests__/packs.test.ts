import type { SvelteRenderParams } from '@fluxdown/svelte-plugins/base';

import { BaseSlotPlugin, createElement } from '@fluxdown/svelte-plugins/base';
import { FallbackPlugin } from '@fluxdown/svelte-plugins/plugins/fallback';
import {
  ParagraphPlugin,
  ParagraphRenderPlugin,
  ParagraphSlotPlugin,
} from '@fluxdown/svelte-plugins/plugins/paragraph';
import { PluginPriority } from '@fluxdown/types';
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';
import { Paragraph } from './fixtures/paragraph';

class CustomParagraphRenderPlugin extends ParagraphRenderPlugin {
  render({ renderChildren }: SvelteRenderParams) {
    return createElement('section', { 'data-testid': 'custom-render' }, renderChildren());
  }
}

class LaterParagraphRenderPlugin extends ParagraphRenderPlugin {
  render({ renderChildren }: SvelteRenderParams) {
    return createElement('aside', { 'data-testid': 'later-render' }, renderChildren());
  }
}

class CustomParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'slot-paragraph';

  readonly type = 'Paragraph';

  readonly Component = Paragraph;
}

afterEach(cleanup);

test('raw installs only the supplied plugins', async () => {
  const view = render(FluxdownRaw, { plugins: [], text: 'content' });

  expect(view.container.firstElementChild?.textContent).toBe('');

  expect(view.container.firstElementChild?.children).toHaveLength(0);

  await view.rerender({ plugins: FallbackPlugin });

  expect(view.container.querySelector('p')).toHaveTextContent('content');

  expect(view.container.querySelector('p')?.className).toBe('');

  await view.rerender({ plugins: [ParagraphPlugin, FallbackPlugin] });

  expect(view.container.querySelector('p')?.className).not.toBe('');
});

test('lite renders code and formulas without a highlighting or formula engine', () => {
  const view = render(FluxdownLite, {
    build: { tex: true },
    text: '```ts\nconst answer = 42;\n```\n\n$x + y$',
  });

  expect(view.container.querySelector('pre code')).toHaveTextContent('const answer = 42;');

  expect(view.container).toHaveTextContent('x + y');

  expect(view.container.querySelector('.shiki, .katex, mjx-container')).toBeNull();
});

describe.each([
  { name: 'lite', Component: FluxdownLite },
  { name: 'full', Component: Fluxdown },
])('$name preset overrides', ({ Component }) => {
  test('uses the last renderer at equal priority and follows pack order changes', async () => {
    const view = render(Component, {
      text: 'custom',
      plugins: [
        { renders: [CustomParagraphRenderPlugin] },
        { renders: [LaterParagraphRenderPlugin] },
      ],
    });

    expect(screen.getByTestId('later-render')).toHaveTextContent('custom');

    expect(screen.queryByTestId('custom-render')).not.toBeInTheDocument();

    await view.rerender({
      plugins: [
        { renders: [LaterParagraphRenderPlugin] },
        { renders: [CustomParagraphRenderPlugin] },
      ],
    });

    expect(screen.getByTestId('custom-render')).toHaveTextContent('custom');

    expect(screen.queryByTestId('later-render')).not.toBeInTheDocument();
  });

  test('keeps explicit priority stronger than declaration order', async () => {
    const view = render(Component, {
      text: 'priority',
      plugins: {
        renders: [
          [CustomParagraphRenderPlugin, { priority: PluginPriority.High }],
          [LaterParagraphRenderPlugin, { priority: PluginPriority.Low }],
        ],
      },
    });

    expect(screen.getByTestId('custom-render')).toHaveTextContent('priority');

    expect(screen.queryByTestId('later-render')).not.toBeInTheDocument();

    await view.rerender({
      plugins: { renders: [[LaterParagraphRenderPlugin, { priority: PluginPriority.Low }]] },
    });

    expect(view.container.querySelector('p')).toHaveTextContent('priority');

    expect(screen.queryByTestId('later-render')).not.toBeInTheDocument();
  });

  test('composes user slots around defaults and removes disabled defaults', async () => {
    const view = render(Component, {
      text: 'composed',
      plugins: { slots: [CustomParagraphSlotPlugin] },
    });

    expect(screen.getByTestId('custom-slot')).toContainElement(view.container.querySelector('p'));

    await view.rerender({
      plugins: {
        config: { 'slot-paragraph': { disabled: true } },
        slots: [ParagraphSlotPlugin],
      },
    });

    expect(screen.queryByTestId('custom-slot')).not.toBeInTheDocument();

    expect(view.container.querySelector('p')).toBeNull();

    await view.rerender({ plugins: { renders: [[ParagraphRenderPlugin, { disabled: true }]] } });

    expect(view.container.querySelector('p')).toHaveTextContent('composed');

    expect(view.container.querySelector('p')?.className).toBe('');

    await view.rerender({ plugins: [] });

    expect(view.container.querySelector('p')?.className).not.toBe('');
  });
});
