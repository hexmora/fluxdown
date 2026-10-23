import { render, waitFor } from '@testing-library/react';

import { SlotProvider } from '../../../../../base';
import { CodeHighlighterSlotPlugin } from '../../../../code';
import PeleRenderer from '../renderer/components/pele';

describe('Pele diagram output', () => {
  test.each([
    ['mermaid', 'flowchart LR\nA[前端] --> B[后端]', 'flowchart', '前端'],
    ['mindmap', 'mindmap\n  Project\n    计划\n      Build\n    Ship', 'mindmap', '计划'],
  ])('renders %s code as SVG', async (language, code, type, label) => {
    const { container } = render(
      <SlotProvider plugins={[CodeHighlighterSlotPlugin]}>
        <PeleRenderer Raw={null} code={code} language={language} showHeader={false} />
      </SlotProvider>,
    );

    await waitFor(() =>
      expect(container.querySelector(`svg.pele-${type}`)).toHaveTextContent(label),
    );

    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      expect.stringMatching(/^0 0 [\d.]+ [\d.]+$/),
    );
    expect(container.querySelector('pre')).toBeNull();
  });

  test('keeps labels and diagram links from becoming executable markup', async () => {
    const { container } = render(
      <SlotProvider plugins={[CodeHighlighterSlotPlugin]}>
        <PeleRenderer
          Raw={null}
          code={
            'flowchart LR\nA["<script>alert(1)</script>"] --> B["安全"]\nclick B "javascript:alert(1)"'
          }
          language="mermaid"
          showHeader={false}
        />
      </SlotProvider>,
    );

    await waitFor(() => expect(container.querySelector('figure svg')).toHaveTextContent('安全'));

    expect(
      container.querySelector('script, a, image, foreignObject, [onerror], [onload]'),
    ).toBeNull();
    expect(container.querySelector('figure')!.innerHTML).not.toMatch(/javascript:/i);
  });
});
