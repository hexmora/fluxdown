import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();
});

test('renders common Markdown through styled preset slots', () => {
  const text = [
    '# Heading',
    '',
    'A **strong** and *emphasized* [link](https://example.com) with `code`.',
    '',
    '> quote',
    '',
    '1. first',
    '2. second',
    '',
    '---',
    '',
    '```ts',
    'const answer = 42;',
    '```',
    '',
    '| A | B |',
    '| - | - |',
    '| 1 | 2 |',
  ].join('\n');

  const view = render(Fluxdown, { text });

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading');

  expect(view.container.querySelector('p')).toHaveTextContent(
    'A strong and emphasized link with code.',
  );

  expect(view.container.querySelector('strong')).toHaveTextContent('strong');

  expect(view.container.querySelector('em')).toHaveTextContent('emphasized');

  expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com');

  expect(view.container.querySelector('blockquote')).toHaveTextContent('quote');

  expect(view.container.querySelector('ol')).toHaveTextContent('first second');

  expect(view.container.querySelector('hr')).toBeInTheDocument();

  expect(view.container.querySelector('pre code')).toHaveTextContent('const answer = 42;');

  expect(view.container.querySelector('table')).toHaveTextContent('AB12');

  expect(view.container.querySelectorAll('th')).toHaveLength(2);

  expect(view.container.querySelectorAll('td')).toHaveLength(2);
});

test('renders void elements, task lists, and readable formulas while engines load', () => {
  const text = [
    '![diagram](https://example.com/diagram.png "Diagram")',
    '',
    'first line  ',
    'second line',
    '',
    '- [x] ready',
    '- [ ] pending',
    '',
    '$x + y$',
  ].join('\n');

  const view = render(FluxdownLite, { build: { tex: true }, text });

  expect(screen.getByRole('img', { name: 'diagram' })).toHaveAttribute(
    'src',
    'https://example.com/diagram.png',
  );

  expect(screen.getByRole('img', { name: 'diagram' })).toHaveAttribute('title', 'Diagram');

  expect(view.container.querySelector('br')).toBeInTheDocument();

  expect(screen.getAllByRole('checkbox')).toHaveLength(2);

  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();

  expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();

  expect(view.container).toHaveTextContent('x + y');
});

test('keeps one root while forwarding reactive class and style', async () => {
  const view = render(Fluxdown, {
    class: 'consumer-root',
    style: 'color: red',
    text: 'hello',
  });

  const root = view.container.firstElementChild;

  expect(root?.tagName).toBe('DIV');

  expect(root).toHaveClass('fluxdown-svelte-root', 'consumer-root');

  expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });

  await view.rerender({ class: 'updated-root', style: 'color: blue' });

  expect(view.container.firstElementChild).toBe(root);

  expect(root).toHaveClass('updated-root');

  expect(root).not.toHaveClass('consumer-root');

  expect(root).toHaveStyle({ color: 'rgb(0, 0, 255)' });
});

test('preserves the core and existing blocks, then destroys the core on unmount', async () => {
  const view = render(Fluxdown, { text: 'alpha' });

  const core = view.component.getCore();

  const destroy = vi.spyOn(core, 'destroy');

  const firstBlock = screen.getByText('alpha');

  await view.rerender({ text: 'alpha\n\nbeta' });

  expect(screen.getByText('beta')).toBeInTheDocument();

  expect(view.component.getCore()).toBe(core);

  expect(screen.getByText('alpha')).toBe(firstBlock);

  view.unmount();

  expect(destroy).toHaveBeenCalledTimes(1);

  expect(core.value.closed).toBe(true);
});

test('keeps an existing paragraph mounted while its text grows', async () => {
  const view = render(Fluxdown, { text: 'stream' });

  const paragraph = view.container.querySelector('p');

  await view.rerender({ text: 'stream continues' });

  expect(view.container).toHaveTextContent('stream continues');

  expect(view.container.querySelector('p')).toBe(paragraph);
});

test('keeps a blank document empty and clears content when the source resets', async () => {
  const view = render(Fluxdown, { text: '\n \n' });

  expect(view.container.firstElementChild?.textContent).toBe('');

  expect(view.container.firstElementChild?.children).toHaveLength(0);

  await view.rerender({ text: 'content' });

  expect(screen.getByText('content')).toBeInTheDocument();

  await view.rerender({ text: '' });

  expect(view.container.firstElementChild?.textContent).toBe('');

  expect(view.container.firstElementChild?.children).toHaveLength(0);
});

test('updates theme tokens without replacing the root or changing preset defaults', async () => {
  const view = render(Fluxdown, {
    text: 'theme',
    theme: ['dark', { tokens: { typography: { fontSize: { md: '20px' } } } }],
  });

  const root = view.container.firstElementChild as HTMLElement;

  expect(root.style.getPropertyValue('--fluxdown-typography-font-size-md')).toBe('20px');

  const darkBackground = root.style.getPropertyValue('--fluxdown-colors-bg');

  await view.rerender({ theme: 'light' });

  expect(view.container.firstElementChild).toBe(root);

  expect(root.style.getPropertyValue('--fluxdown-typography-font-size-md')).not.toBe('20px');

  expect(root.style.getPropertyValue('--fluxdown-colors-bg')).not.toBe(darkBackground);

  await view.rerender({ theme: 'dark' });

  expect(root.style.getPropertyValue('--fluxdown-typography-font-size-md')).not.toBe('20px');

  expect(root.style.getPropertyValue('--fluxdown-colors-bg')).toBe(darkBackground);
});
