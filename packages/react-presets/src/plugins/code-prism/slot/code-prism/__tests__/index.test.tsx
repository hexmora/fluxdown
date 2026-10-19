import { render } from '@testing-library/react';

import { CodePrismRenderer } from '../renderer';

describe('Prism code rendering', () => {
  test('highlights JavaScript aliases while preserving source and suffixes', () => {
    const code = 'const answer = 42;\n';
    const { container } = render(
      <CodePrismRenderer Raw={null} code={code} language="JS" suffix={<i>tail</i>} />,
    );

    expect(container.querySelector('.token.keyword')).toHaveTextContent('const');
    expect(container.querySelector('.token.number')).toHaveTextContent('42');
    expect(container.querySelector('code')?.textContent).toBe(`${code}tail`);
  });

  test('escapes markup and replaces stale tokens when the language changes', () => {
    const code = '<script>alert("source")</script>\n';
    const { container, rerender } = render(
      <CodePrismRenderer Raw={null} code={code} language="html" />,
    );

    expect(container.querySelector('.token')).not.toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe(code);

    for (const language of ['unknown', '__proto__', 'constructor']) {
      rerender(<CodePrismRenderer Raw={null} code="replacement" language={language} />);
      expect(container.querySelector('.token')).toBeNull();
      expect(container.querySelector('code')?.textContent).toBe('replacement');
    }
  });
});
