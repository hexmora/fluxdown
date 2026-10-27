import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test } from 'vitest';

import { HeadingRenderer } from '../heading-renderer';

const current = { type: 'element', tagName: 'h2', properties: {}, children: [] } as const;

const children = createRawSnippet(() => ({ render: () => '<span>Heading</span>' }));

afterEach(cleanup);

test('renders the requested heading level without forwarding rendering metadata', async () => {
  const view = render(HeadingRenderer, {
    Raw: null,
    level: 2,
    class: 'custom',
    current: { ...current, children: [] },
    parents: [],
    render: () => null,
    children,
  });

  expect(view.container.querySelector('h2')?.textContent).toBe('Heading');

  expect(view.container.querySelector('h2')?.classList.contains('custom')).toBe(true);

  expect(view.container.querySelector('h2')?.getAttribute('current')).toBeNull();

  await view.rerender({ level: 9 });

  expect(view.container.querySelector('h1')).not.toBeNull();
});
