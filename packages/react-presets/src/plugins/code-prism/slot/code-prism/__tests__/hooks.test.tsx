import type { ReactNode } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';

import { useHighlighted } from '../renderer/hooks';
import { highlightCode as highlightCodeImplementation } from '../renderer/utils';

jest.mock('../renderer/utils', () => ({ highlightCode: jest.fn() }));

const highlightCode = jest.mocked(highlightCodeImplementation);

interface PendingHighlight {
  resolve: (tokens: ReactNode) => void;
  signal?: AbortSignal;
}

beforeEach(() => {
  highlightCode.mockReset();
});

describe('useHighlighted', () => {
  test('defers highlighting and cancels obsolete code requests', async () => {
    const pending = new Map<string, PendingHighlight>();

    highlightCode.mockImplementation(
      (code: string, _language: string, signal?: AbortSignal) =>
        new Promise<ReactNode>((resolve) => {
          pending.set(code, { resolve, signal });
        }),
    );

    const { result, rerender } = renderHook(({ code }) => useHighlighted(code, 'js'), {
      initialProps: { code: 'before' },
    });

    expect(highlightCode).not.toHaveBeenCalled();
    expect(result.current).toBeNull();

    await waitFor(() => expect(pending.has('before')).toBe(true));
    rerender({ code: 'after' });
    await waitFor(() => expect(pending.has('after')).toBe(true));

    expect(pending.get('before')?.signal?.aborted).toBe(true);

    const currentTokens = <span className="token keyword">after</span>;

    await act(async () => pending.get('after')?.resolve(currentTokens));
    expect(result.current).toBe(currentTokens);

    await act(async () => pending.get('before')?.resolve(<span>before</span>));
    expect(result.current).toBe(currentTokens);
  });

  test('hides previous tokens immediately when the language changes', async () => {
    const pending = new Map<string, PendingHighlight>();

    highlightCode.mockImplementation(
      (_code: string, language: string, signal?: AbortSignal) =>
        new Promise<ReactNode>((resolve) => {
          pending.set(language, { resolve, signal });
        }),
    );

    const { result, rerender } = renderHook(({ language }) => useHighlighted('source', language), {
      initialProps: { language: 'js' },
    });

    await waitFor(() => expect(pending.has('js')).toBe(true));
    await act(async () => pending.get('js')?.resolve(<span>JavaScript tokens</span>));
    expect(result.current).not.toBeNull();

    rerender({ language: 'css' });
    expect(result.current).toBeNull();
    expect(pending.get('js')?.signal?.aborted).toBe(true);

    await waitFor(() => expect(pending.has('css')).toBe(true));
    rerender({ language: 'html' });
    await waitFor(() => expect(pending.has('html')).toBe(true));

    await act(async () => pending.get('css')?.resolve(<span>Stale CSS tokens</span>));
    expect(result.current).toBeNull();

    const currentTokens = <span>HTML tokens</span>;

    await act(async () => pending.get('html')?.resolve(currentTokens));
    expect(result.current).toBe(currentTokens);
  });

  test('aborts pending highlighting when unmounted', async () => {
    let pending: PendingHighlight | undefined;

    highlightCode.mockImplementation(
      (_code: string, _language: string, signal?: AbortSignal) =>
        new Promise<ReactNode>((resolve) => {
          pending = { resolve, signal };
        }),
    );

    const { unmount } = renderHook(() => useHighlighted('source', 'js'));

    await waitFor(() => expect(pending).toBeDefined());
    unmount();
    expect(pending?.signal?.aborted).toBe(true);

    await act(async () => pending?.resolve(<span>source</span>));
  });

  test('skips highlighting when unmounted before the lazy import resolves', async () => {
    const { unmount } = renderHook(() => useHighlighted('source', 'js'));

    unmount();
    await act(async () => {});

    expect(highlightCode).not.toHaveBeenCalled();
  });

  test.each(['failed', 'unsupported'])(
    'keeps plaintext available for %s highlighting',
    async (mode) => {
      if (mode === 'failed') {
        highlightCode.mockRejectedValue(new Error('Language chunk unavailable'));
      } else {
        highlightCode.mockResolvedValue(null);
      }

      const { result } = renderHook(() => useHighlighted('source', 'js'));

      await waitFor(() => expect(highlightCode).toHaveBeenCalledTimes(1));
      expect(result.current).toBeNull();
    },
  );
});
