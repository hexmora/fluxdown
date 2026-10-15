import { render, waitFor } from '@testing-library/react';

import { PREFIX } from '../../../base';
import { CodeHighlighterRenderer } from '../renderer';

describe('code highlighting', () => {
  test('uses runtime CSS theme tokens for highlighted code', async () => {
    const { container } = render(
      <CodeHighlighterRenderer Raw={null} code="const answer: number = 42;" language="TS" />,
    );

    await waitFor(() => expect(container.querySelector('code span')).not.toBeNull());

    const spans = [...container.querySelectorAll('code span')];

    expect(
      spans.some((span) => span.getAttribute('style')?.includes(`var(--${PREFIX}-syntax-keyword)`)),
    ).toBe(true);

    expect(
      spans.some((span) => span.getAttribute('style')?.includes(`var(--${PREFIX}-syntax-number)`)),
    ).toBe(true);
  });

  test('preserves source text, newlines, and root attributes without parsing source HTML', async () => {
    const code = '<script>alert("source")</script>\n\n';

    const { container } = render(
      <CodeHighlighterRenderer
        Raw={null}
        className="custom-code"
        code={code}
        language="html"
        style={{ maxHeight: 300 }}
      />,
    );

    await waitFor(() => expect(container.querySelector('code span')).not.toBeNull());

    expect(container.firstElementChild).toHaveClass('custom-code');

    expect(container.firstElementChild).toHaveStyle({ maxHeight: '300px' });

    expect(container.querySelector('code')).toHaveTextContent('alert("source")');

    expect(container.querySelector('code')?.textContent).toBe(code);

    expect(container.querySelector('script')).toBeNull();
  });

  test('shows the current source immediately when code or language changes', async () => {
    const { container, rerender } = render(
      <CodeHighlighterRenderer Raw={null} code="const oldValue = 1" language="javascript" />,
    );

    await waitFor(() => expect(container.querySelector('code span')).not.toBeNull());

    rerender(<CodeHighlighterRenderer Raw={null} code="replacement" language="unknown" />);

    expect(container.querySelector('code')?.textContent).toBe('replacement');

    expect(container.querySelector('code span')).toBeNull();
  });
});
