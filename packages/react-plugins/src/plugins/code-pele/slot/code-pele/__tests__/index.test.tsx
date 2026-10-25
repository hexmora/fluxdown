import type { PropsWithChildren } from 'react';

import { act, render, waitFor } from '@testing-library/react';

import { SlotProvider } from '../../../../../base';
import { CodeHeaderSlotPlugin } from '../../../../code';
import PeleRenderer from '../renderer/components/pele';

const mockRender = jest.fn<Promise<{ svg: string }>, [string]>();

const Raw = ({ code }: { code: string }) => <pre data-original>{code}</pre>;

jest.mock('pele/lazy', () => ({
  renderAsync: (code: string) => mockRender(code),
}));

const Provider = ({ children }: PropsWithChildren) => (
  <SlotProvider plugins={[CodeHeaderSlotPlugin]}>{children}</SlotProvider>
);

describe('diagram updates', () => {
  beforeEach(() => {
    mockRender.mockReset();
  });

  test('shows source until ready and displays the latest code when renders finish out of order', async () => {
    let resolveFirst!: (result: { svg: string }) => void;

    mockRender.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)));
    mockRender.mockResolvedValueOnce({ svg: '<svg><text>current</text></svg>' });

    const { container, rerender } = render(
      <PeleRenderer code="graph TD; A-->B" language="mermaid" Raw={Raw} />,
      { wrapper: Provider },
    );

    expect(container.querySelector('[data-original]')).toHaveTextContent('graph TD; A-->B');

    rerender(<PeleRenderer code="graph TD; C-->D" language="mermaid" Raw={Raw} />);

    await waitFor(() => expect(container.querySelector('figure svg')).toHaveTextContent('current'));

    await act(async () => {
      resolveFirst({ svg: '<svg><text>stale</text></svg>' });
    });

    expect(container.querySelector('figure svg')).toHaveTextContent('current');
    expect(container.querySelector('pre')).toBeNull();
  });

  test('falls back to source on errors and retains the last valid diagram during incomplete edits', async () => {
    mockRender.mockRejectedValueOnce(new Error('Invalid diagram'));

    const { container, rerender } = render(
      <PeleRenderer code="graph TD; A-->" language="mermaid" Raw={Raw} />,
      { wrapper: Provider },
    );

    await act(async () => {});

    expect(container.querySelector('[data-original]')).toHaveTextContent('graph TD; A-->');

    rerender(<PeleRenderer code="graph TD; A-->" language="mermaid" Raw={null} />);

    expect(container).toBeEmptyDOMElement();

    mockRender.mockResolvedValueOnce({ svg: '<svg><text>valid</text></svg>' });

    rerender(<PeleRenderer code="graph TD; A-->B" language="mermaid" Raw={Raw} />);

    await waitFor(() => expect(container.querySelector('figure svg')).toHaveTextContent('valid'));

    mockRender.mockRejectedValueOnce(new Error('Incomplete diagram'));

    await act(async () => {
      rerender(<PeleRenderer code="graph TD; A-->B; B-->" language="mermaid" Raw={Raw} />);
    });

    expect(container.querySelector('figure svg')).toHaveTextContent('valid');
    expect(container.querySelector('pre')).toBeNull();
  });
});
