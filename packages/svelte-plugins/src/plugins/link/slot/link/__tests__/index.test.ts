import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { LinkRenderer } from '../link-renderer';

const current = { type: 'element', tagName: 'a', properties: {}, children: [] } as const;

const children = createRawSnippet(() => ({ render: () => '<span>Link</span>' }));

const props = {
  Raw: null,
  current: { ...current, children: [] },
  parents: [],
  render: () => null,
  children,
};

afterEach(cleanup);

test.each(['javascript:alert(1)', 'data:text/html,test', 'vbscript:test'])(
  'excludes unsafe link URL %s',
  (href) => {
    const view = render(LinkRenderer, { ...props, href });

    expect(view.container.querySelector('a')?.hasAttribute('href')).toBe(false);

    expect(view.container.textContent).toBe('Link');
  },
);

test.each(['/guide', '#heading', 'mailto:test@example.com', 'https://example.com'])(
  'preserves supported link URL %s',
  (href) => {
    const view = render(LinkRenderer, { ...props, href });

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(href);
  },
);

test('forwards Svelte event handlers without replacing their event', async () => {
  const onclick = vi.fn((event: MouseEvent) => event.preventDefault());

  const view = render(LinkRenderer, { ...props, href: '/guide', onclick });

  await fireEvent.click(view.getByRole('link'));

  expect(onclick).toHaveBeenCalledOnce();

  expect(onclick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
});
