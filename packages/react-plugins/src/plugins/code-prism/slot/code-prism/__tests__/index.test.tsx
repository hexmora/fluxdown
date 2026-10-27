import { render, waitFor } from '@testing-library/react';

import { CodePrismRenderer } from '../renderer';

describe('Prism code rendering', () => {
  test('highlights JavaScript aliases while preserving source and suffixes', async () => {
    const code = 'const answer = 42;\n';
    const { container } = render(
      <CodePrismRenderer Raw={null} code={code} language="JS" suffix={<i>tail</i>} />,
    );

    expect(container.querySelector('.token')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe(`${code}tail`);

    // A cold Jest transform of Prism's language bundle can exceed one second on CI.
    await waitFor(
      () => expect(container.querySelector('.token.keyword')).toHaveTextContent('const'),
      { timeout: 10_000 },
    );
    expect(container.querySelector('.token.number')).toHaveTextContent('42');
    expect(container.querySelector('code')?.textContent).toBe(`${code}tail`);
  }, 15_000);

  test('escapes markup and replaces stale tokens when the language changes', async () => {
    const code = '<script>alert("source")</script>\n';
    const { container, rerender } = render(
      <CodePrismRenderer Raw={null} code={code} language="html" />,
    );

    await waitFor(() => expect(container.querySelector('.token')).not.toBeNull(), {
      timeout: 10_000,
    });
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe(code);

    for (const language of ['unknown', '__proto__', 'constructor']) {
      rerender(<CodePrismRenderer Raw={null} code="replacement" language={language} />);
      expect(container.querySelector('.token')).toBeNull();
      expect(container.querySelector('code')?.textContent).toBe('replacement');
    }
  }, 15_000);
});
