import { render, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import { CodePrismRenderer } from '../renderer';
import { highlightCode } from '../renderer/utils';

vi.mock('../renderer/utils', () => ({ highlightCode: vi.fn() }));

describe('Prism renderer', () => {
  test('keeps current source visible and ignores a stale highlight', async () => {
    let resolveFirst!: (value: string) => void;

    let resolveSecond!: (value: string) => void;

    vi.mocked(highlightCode)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const [code, setCode] = createSignal('first source');

    const wrapper = render(() => {
      return <CodePrismRenderer Raw={null} code={code()} language="javascript" />;
    });

    await waitFor(() => expect(highlightCode).toHaveBeenCalledTimes(1));

    setCode('second source');

    await waitFor(() => expect(highlightCode).toHaveBeenCalledTimes(2));

    expect(wrapper.container.textContent).toBe('second source');

    resolveFirst('stale highlight');

    await Promise.resolve();

    expect(wrapper.container.textContent).toBe('second source');

    resolveSecond('current highlight');

    await waitFor(() => expect(wrapper.container.textContent).toBe('current highlight'));

    wrapper.unmount();
  });
});
