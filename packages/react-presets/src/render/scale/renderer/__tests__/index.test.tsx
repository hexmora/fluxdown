import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import { ScaleRenderer } from '..';

describe('ScaleRenderer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('continues an in-flight character after remount and skips completed animation', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1100);

    const first = render(
      <ScaleRenderer blur={0.08} duration={200} from={0} start={1000}>
        A
      </ScaleRenderer>,
    );

    expect(screen.getByText('A').parentElement).toHaveClass('active');

    expect(screen.getByText('A').parentElement).toHaveStyle({ animationDelay: '-100ms' });

    first.unmount();

    now.mockReturnValue(1150);

    const second = render(
      <ScaleRenderer blur={0.08} duration={200} from={0} start={1000}>
        A
      </ScaleRenderer>,
    );

    expect(screen.getByText('A').parentElement).toHaveStyle({ animationDelay: '-150ms' });

    second.unmount();

    now.mockReturnValue(1250);

    render(
      <ScaleRenderer blur={0.08} duration={200} from={0} start={1000}>
        A
      </ScaleRenderer>,
    );

    expect(screen.getByText('A').parentElement).not.toHaveClass('active');
  });

  test('retains a character during updates and only restarts a new arrival', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1100);

    const view = render(
      <ScaleRenderer blur={0.08} duration={200} from={0} start={1000}>
        A
      </ScaleRenderer>,
    );

    const glyph = screen.getByText('A');

    const outer = glyph.parentElement;

    now.mockReturnValue(1200);

    view.rerender(
      <ScaleRenderer blur={0.08} duration={200} from={0} start={1000}>
        A
      </ScaleRenderer>,
    );

    expect(screen.getByText('A')).toBe(glyph);

    expect(outer).toHaveStyle({ animationDelay: '-100ms' });

    view.rerender(
      <ScaleRenderer blur={0.08} duration={200} from={0} start={1200}>
        B
      </ScaleRenderer>,
    );

    expect(screen.getByText('B')).not.toBe(glyph);

    expect(screen.getByText('B').parentElement).not.toBe(outer);

    expect(screen.getByText('B').parentElement).toHaveStyle({ animationDelay: '0ms' });
  });

  test('renders static characters without time-dependent server markup', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1100);

    const element = (
      <ScaleRenderer blur={0.08} duration={200} from={0} start={0}>
        A
      </ScaleRenderer>
    );

    const first = renderToString(element);

    now.mockReturnValue(1800);

    expect(renderToString(element)).toBe(first);

    expect(first).not.toContain('active');
  });
});
