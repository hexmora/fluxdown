import { fireEvent, render, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import { CodeHeaderRenderer } from '../renderer';

afterEach(() => {
  vi.unstubAllGlobals();

  vi.useRealTimers();
});

describe('code header', () => {
  test('copies source and reports metadata after the clipboard succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    const onCopy = vi.fn();

    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const view = render(() => (
      <CodeHeaderRenderer
        Raw={null}
        code="const answer = 42;"
        language="ts"
        meta="example.ts"
        onCopy={onCopy}
      />
    ));

    fireEvent.click(view.getByRole('button'));

    await waitFor(() => expect(onCopy).toHaveBeenCalledOnce());

    expect(writeText).toHaveBeenCalledWith('const answer = 42;');

    expect(onCopy).toHaveBeenCalledWith({
      code: 'const answer = 42;',
      language: 'ts',
      meta: 'example.ts',
    });

    expect(view.getByRole('button').textContent).toBe('Copied');
  });

  test('ignores a stale clipboard result after the source changes', async () => {
    let resolve: (() => void) | undefined;

    const promise = new Promise<void>((finish) => {
      resolve = finish;
    });

    const onCopy = vi.fn();

    vi.stubGlobal('navigator', { clipboard: { writeText: () => promise } });

    const [code, setCode] = createSignal('first');

    const view = render(() => <CodeHeaderRenderer Raw={null} code={code()} onCopy={onCopy} />);

    fireEvent.click(view.getByRole('button'));

    setCode('second');

    resolve?.();

    await promise;

    await Promise.resolve();

    expect(onCopy).not.toHaveBeenCalled();

    expect(view.getByRole('button').textContent).toBe('Copy');
  });

  test('does not report a pending copy after unmount', async () => {
    let resolve: (() => void) | undefined;

    const promise = new Promise<void>((finish) => {
      resolve = finish;
    });

    const onCopy = vi.fn();

    vi.stubGlobal('navigator', { clipboard: { writeText: () => promise } });

    const view = render(() => <CodeHeaderRenderer Raw={null} code="pending" onCopy={onCopy} />);

    fireEvent.click(view.getByRole('button'));

    view.unmount();

    resolve?.();

    await promise;

    await Promise.resolve();

    expect(onCopy).not.toHaveBeenCalled();
  });
});
