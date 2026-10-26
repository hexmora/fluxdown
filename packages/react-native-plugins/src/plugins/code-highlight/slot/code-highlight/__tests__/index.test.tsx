import { render } from '@testing-library/react';

import HighlightRenderer from '../renderer/components/highlight';

describe('native syntax highlighting', () => {
  test('renders language tokens with native text and preserves indentation and blank rows', () => {
    const { container } = render(
      <HighlightRenderer
        Raw={null}
        language="typescript"
        code={'const one = 1;\n\n  const two = 2;'}
      />,
    );

    expect(container).toHaveTextContent('const one = 1;');

    expect(container.textContent).toContain('  const two = 2;');

    expect(container.querySelector('[style*="min-height"]')).not.toBeNull();

    expect(container.querySelector('[style*="color: rgb(207, 34, 46)"]')).not.toBeNull();
  });

  test('keeps source readable for unknown languages', () => {
    const { container } = render(
      <HighlightRenderer Raw={null} language="not-a-language" code="source <still> visible" />,
    );

    expect(container).toHaveTextContent('source <still> visible');
  });
});
