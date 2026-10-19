import { render } from '@testing-library/react';

import { CodeHighlighterRenderer } from '../renderer';

describe('source code rendering', () => {
  test('preserves literal code and suffixes without adding highlight markup', () => {
    const code = '<script>alert("source")</script>\n\n';
    const { container } = render(
      <CodeHighlighterRenderer
        Raw={null}
        className="custom-code"
        code={code}
        language="html"
        suffix={<i>tail</i>}
      />,
    );

    expect(container.querySelector('code')?.textContent).toBe(`${code}tail`);
    expect(container.querySelector('script, .token')).toBeNull();
    expect(container.querySelector('i')).toHaveTextContent('tail');
    expect(container.firstElementChild).toHaveClass('custom-code');
    expect(container.firstElementChild).toHaveAttribute('tabindex', '0');
  });
});
