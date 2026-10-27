import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test } from 'vitest';

import { SuffixRenderer } from '..';

afterEach(cleanup);

test.each(['cursor', 'dot'] as const)('renders an accessible decorative %s marker', (type) => {
  const view = render(SuffixRenderer, { type });

  const marker = view.container.querySelector('[data-fluxdown-suffix]');

  expect(marker?.getAttribute('data-fluxdown-suffix')).toBe(type);

  expect(marker?.getAttribute('aria-hidden')).toBe('true');

  expect(marker?.querySelector(`.marker.${type}`)).not.toBeNull();

  expect(view.container.textContent).toBe('');
});

test('retains the marker when its type changes', async () => {
  const view = render(SuffixRenderer, { type: 'cursor' });

  const marker = view.container.querySelector('.marker');

  await view.rerender({ type: 'dot' });

  expect(view.container.querySelector('.marker.dot')).toBe(marker);
});

test('renders custom content inside the marker', () => {
  const children = createRawSnippet(() => ({ render: () => '<span>loading</span>' }));

  const view = render(SuffixRenderer, { type: 'custom', children });

  expect(view.container.querySelector('.custom')?.textContent).toBe('loading');

  expect(view.container.textContent).toBe('loading');
});
