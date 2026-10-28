import type { RenderResult } from 'pele';

import { render, waitFor } from '@solidjs/testing-library';
import { renderAsync } from 'pele/lazy';
import { createSignal } from 'solid-js';

import type { CodeBlockProps } from '../../../../../base';

import { CodePeleRenderer } from '../renderer';
import PeleRenderer from '../renderer/components/pele';

vi.mock('pele/lazy', () => ({ renderAsync: vi.fn() }));

const RawRenderer = (props: Omit<CodeBlockProps, 'Raw'>) => {
  return <pre>{props.code}</pre>;
};

const diagram = (label: string): RenderResult => {
  return {
    svg: `<svg><text>${label}</text></svg>`,
    width: 100,
    height: 20,
    links: [],
    type: 'flowchart',
    mermaidType: 'flowchart-v2',
  };
};

describe('Pele renderer', () => {
  test('switches between the raw slot and diagram when language changes', async () => {
    vi.mocked(renderAsync).mockResolvedValue(diagram('rendered diagram'));

    const [language, setLanguage] = createSignal('plaintext');

    const wrapper = render(() => {
      return (
        <CodePeleRenderer
          Raw={RawRenderer}
          code="graph LR; A-->B"
          language={language()}
          showHeader={false}
        />
      );
    });

    expect(wrapper.container.querySelector('pre')?.textContent).toBe('graph LR; A-->B');

    setLanguage('MERMAID');

    await waitFor(() =>
      expect(wrapper.container.querySelector('figure')?.textContent).toBe('rendered diagram'),
    );

    setLanguage('javascript');

    expect(wrapper.container.querySelector('figure')).toBeNull();

    expect(wrapper.container.querySelector('pre')?.textContent).toBe('graph LR; A-->B');

    wrapper.unmount();
  });

  test('retains the last valid diagram and ignores obsolete asynchronous results', async () => {
    const pending: ((value: RenderResult) => void)[] = [];

    vi.mocked(renderAsync).mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );

    const [code, setCode] = createSignal('first source');

    const wrapper = render(() => {
      return <PeleRenderer Raw={RawRenderer} code={code()} language="mermaid" showHeader={false} />;
    });

    expect(wrapper.container.textContent).toBe('first source');

    pending[0](diagram('first diagram'));

    await waitFor(() =>
      expect(wrapper.container.querySelector('figure')?.textContent).toBe('first diagram'),
    );

    setCode('second source');

    expect(wrapper.container.querySelector('figure')?.textContent).toBe('first diagram');

    setCode('third source');

    pending[1](diagram('obsolete diagram'));

    await Promise.resolve();

    expect(wrapper.container.querySelector('figure')?.textContent).toBe('first diagram');

    pending[2](diagram('current diagram'));

    await waitFor(() =>
      expect(wrapper.container.querySelector('figure')?.textContent).toBe('current diagram'),
    );

    setCode('');

    expect(wrapper.container.querySelector('figure')).toBeNull();

    wrapper.unmount();
  });
});
