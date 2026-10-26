import type { PropsWithChildren } from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { Text } from 'react-native';

import type { Diagram } from '../renderer/components/mermaid/type';

import { SlotProvider } from '../../../../../base';
import { CodeHeaderSlotPlugin } from '../../../../code';
import MermaidRenderer from '../renderer/components/mermaid';

const mockRender = jest.fn<Promise<Diagram | null>, [string]>();

jest.mock('../renderer/components/mermaid/utils', () => ({
  renderDiagram: (code: string) => mockRender(code),
  decodeSvgEntities: (value: unknown) => value,
}));

jest.mock('react-native-svg', () => ({
  parse: (xml: string) => xml,
  SvgAst: ({ ast }: { ast: string }) => <span data-diagram>{ast}</span>,
}));

const Raw = ({ code }: { code: string }) => <Text testID="source">{code}</Text>;

const Provider = ({ children }: PropsWithChildren) => (
  <SlotProvider plugins={[CodeHeaderSlotPlugin]}>{children}</SlotProvider>
);

const diagram = (svg: string): Diagram => ({ svg, width: 120, height: 80, label: 'Diagram' });

describe('native diagram streaming', () => {
  beforeEach(() => mockRender.mockReset());

  test('ignores stale async results when a newer chunk has already rendered', async () => {
    let finishFirst!: (result: Diagram) => void;

    mockRender.mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)));

    mockRender.mockResolvedValueOnce(diagram('current'));

    const { container, getByTestId, rerender } = render(
      <MermaidRenderer code="flowchart LR\nA-->B" language="mermaid" Raw={Raw} />,
      { wrapper: Provider },
    );

    expect(getByTestId('source')).toHaveTextContent('A-->B');

    rerender(<MermaidRenderer code="flowchart LR\nC-->D" language="mermaid" Raw={Raw} />);

    await waitFor(() =>
      expect(container.querySelector('[data-diagram]')).toHaveTextContent('current'),
    );

    await act(async () => finishFirst(diagram('stale')));

    expect(container.querySelector('[data-diagram]')).toHaveTextContent('current');
  });

  test('keeps a valid diagram during unfinished input and clears it for empty content', async () => {
    mockRender.mockResolvedValueOnce(diagram('valid'));

    const { container, getByTestId, rerender } = render(
      <MermaidRenderer code="flowchart LR\nA-->B" language="mermaid" Raw={Raw} />,
      { wrapper: Provider },
    );

    await waitFor(() =>
      expect(container.querySelector('[data-diagram]')).toHaveTextContent('valid'),
    );

    mockRender.mockResolvedValueOnce(null);

    await act(async () => {
      rerender(<MermaidRenderer code="flowchart LR\nA-->" language="mermaid" loading Raw={Raw} />);
    });

    expect(container.querySelector('[data-diagram]')).toHaveTextContent('valid');

    rerender(<MermaidRenderer code="" language="mermaid" Raw={Raw} />);

    expect(container.querySelector('[data-diagram]')).toBeNull();

    expect(getByTestId('source')).toBeEmptyDOMElement();
  });

  test('returns to source when the completed stream is invalid', async () => {
    mockRender.mockResolvedValueOnce(diagram('valid'));

    const { container, getByTestId, rerender } = render(
      <MermaidRenderer code="flowchart LR\nA-->B" language="mermaid" loading Raw={Raw} />,
      { wrapper: Provider },
    );

    await waitFor(() =>
      expect(container.querySelector('[data-diagram]')).toHaveTextContent('valid'),
    );

    mockRender.mockResolvedValue(null);

    await act(async () => {
      rerender(<MermaidRenderer code="unfinished" language="mermaid" loading Raw={Raw} />);
    });

    expect(container.querySelector('[data-diagram]')).toHaveTextContent('valid');

    await act(async () => {
      rerender(<MermaidRenderer code="unfinished" language="mermaid" Raw={Raw} />);
    });

    expect(container.querySelector('[data-diagram]')).toBeNull();

    expect(getByTestId('source')).toHaveTextContent('unfinished');
  });
});
