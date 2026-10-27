import { act, render, waitFor } from '@lynx-js/react/testing-library';
import { describe, expect, it } from '@rstest/core';

import type { FluxdownRef } from '../packs/full';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

describe('ReactLynx renderer', () => {
  it('renders Markdown through native text elements', async () => {
    const { container } = render(<FluxdownLite text="Hello **Lynx**" />);

    await waitFor(() => expect(container.textContent).toContain('Hello Lynx'));

    expect(container.querySelector('text')).not.toBeNull();

    expect(container.querySelector('div')).toBeNull();
  });

  it('updates the rendered text', async () => {
    const { container, rerender } = render(<FluxdownLite text="First paragraph" />);

    await waitFor(() => expect(container.textContent).toContain('First paragraph'));

    rerender(<FluxdownLite text="Second paragraph" />);

    await waitFor(() => expect(container.textContent).toContain('Second paragraph'));

    expect(container.textContent).not.toContain('First paragraph');
  });

  it('exposes the full preset as the default component', async () => {
    const { container } = render(<Fluxdown text="# Heading" />);

    await waitFor(() => expect(container.textContent).toContain('Heading'));
  });

  it('retains a completed block when the trailing paragraph grows', async () => {
    const { container, rerender } = render(<FluxdownLite text={'# Stable heading\n\nPartial'} />);

    await waitFor(() => expect(container.textContent).toContain('Partial'));

    const heading = container.querySelector('.fluxdown-heading');

    expect(heading).not.toBeNull();

    rerender(<FluxdownLite text={'# Stable heading\n\nPartial text continues'} />);

    await waitFor(() => expect(container.textContent).toContain('Partial text continues'));

    expect(container.querySelector('.fluxdown-heading')).toBe(heading);
  });

  it('keeps the Core ref stable across text updates and clears it on unmount', async () => {
    let current: FluxdownRef | null = null;

    const ref = (value: FluxdownRef | null) => {
      current = value;
    };

    const { container, rerender, unmount } = render(<FluxdownLite text="Before" ref={ref} />);

    await waitFor(() => expect(container.textContent).toContain('Before'));

    const initial = current;

    expect(initial).not.toBeNull();

    rerender(<FluxdownLite text="After" ref={ref} />);

    await waitFor(() => expect(container.textContent).toContain('After'));

    expect(current).toBe(initial);

    unmount();

    await act(async () => {});

    expect(current).toBeNull();
  });

  it('drains all received text when streaming stops', async () => {
    const text = 'A complete answer that arrives in one large update.';

    const { container, rerender } = render(<FluxdownLite text="" streaming />);

    rerender(<FluxdownLite text={text} streaming />);

    rerender(<FluxdownLite text={text} streaming={false} />);

    await waitFor(() => expect(container.textContent).toContain(text));
  });

  it.each(['scale', 'shad', 'chunk', 'suffix'] as const)(
    'renders and settles the %s streaming effect',
    async (effect) => {
      const { container, rerender } = render(
        <FluxdownLite text="A" streaming={{ effect, smooth: false }} />,
      );

      rerender(<FluxdownLite text="A **complete** answer" streaming={{ effect, smooth: false }} />);

      await waitFor(() => expect(container.textContent).toContain('A complete answer'));

      rerender(<FluxdownLite text="A **complete** answer" streaming={false} />);

      await waitFor(() => expect(container.textContent).toBe('A complete answer'));
    },
  );
});
