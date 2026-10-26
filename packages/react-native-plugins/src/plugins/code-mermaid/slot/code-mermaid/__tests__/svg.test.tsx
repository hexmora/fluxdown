import { render, waitFor } from '@testing-library/react';

import MermaidRenderer from '../renderer/components/mermaid';

describe('native diagram SVG text', () => {
  test('shows XML-sensitive labels as text through the real native SVG renderer', async () => {
    const { container } = render(
      <MermaidRenderer
        Raw={null}
        language="mermaid"
        code={'flowchart LR\nA["A & B < C"] --> B["Done"]'}
        showHeader={false}
      />,
    );

    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());

    expect(container).toHaveTextContent('A & B < C');

    expect(container.textContent).not.toContain('&amp;');

    expect(container.textContent).not.toContain('&lt;');
  });
});
