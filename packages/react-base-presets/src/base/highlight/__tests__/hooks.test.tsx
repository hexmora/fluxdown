import type { ThemedToken, ThemeRegistrationRaw } from 'shiki/core';

import { act, renderHook, waitFor } from '@testing-library/react';

import { useHighlighted } from '../hooks';
import { highlightCode as highlightCodeImplementation } from '../utils';

jest.mock('../utils', () => ({ highlightCode: jest.fn() }));

const highlightCode = jest.mocked(highlightCodeImplementation);

const theme: ThemeRegistrationRaw = { name: 'test', settings: [] };

interface PendingHighlight {
  resolve: (tokens: ThemedToken[][]) => void;

  signal?: AbortSignal;
}

beforeEach(() => {
  highlightCode.mockReset();
});

describe('useHighlighted', () => {
  test('cancels obsolete work and ignores results that resolve after the latest code', async () => {
    const pending = new Map<string, PendingHighlight>();

    highlightCode.mockImplementation(
      (code: string, _language: string, _theme: ThemeRegistrationRaw, signal?: AbortSignal) =>
        new Promise<ThemedToken[][]>((resolve) => {
          pending.set(code, { resolve, signal });
        }),
    );

    const { result, rerender } = renderHook(({ code }) => useHighlighted(code, 'js', theme), {
      initialProps: { code: 'before' },
    });

    await waitFor(() => expect(pending.has('before')).toBe(true));

    rerender({ code: 'after' });

    await waitFor(() => expect(pending.has('after')).toBe(true));

    expect(pending.get('before')?.signal?.aborted).toBe(true);

    const currentTokens = [[{ content: 'after', offset: 0 }]];

    await act(async () => pending.get('after')?.resolve(currentTokens));

    expect(result.current).toBe(currentTokens);

    await act(async () => pending.get('before')?.resolve([[{ content: 'before', offset: 0 }]]));

    expect(result.current).toBe(currentTokens);
  });

  test('keeps plaintext available when highlighting fails', async () => {
    highlightCode.mockRejectedValue(new Error('Language chunk unavailable'));

    const { result } = renderHook(() => useHighlighted('source', 'js', theme));

    await waitFor(() => expect(highlightCode).toHaveBeenCalledTimes(1));

    expect(result.current).toBeNull();
  });

  test('clears old colors immediately and ignores an obsolete theme result', async () => {
    const pending = new Map<ThemeRegistrationRaw, PendingHighlight>();

    highlightCode.mockImplementation(
      (_code, _language, currentTheme, signal) =>
        new Promise<ThemedToken[][]>((resolve) => {
          pending.set(currentTheme, { resolve, signal });
        }),
    );

    const darkTheme: ThemeRegistrationRaw = { name: theme.name, settings: [] };

    const { result, rerender } = renderHook(
      ({ currentTheme }) => useHighlighted('source', 'js', currentTheme),
      { initialProps: { currentTheme: theme } },
    );

    await waitFor(() => expect(pending.has(theme)).toBe(true));

    rerender({ currentTheme: darkTheme });

    expect(result.current).toBeNull();

    await waitFor(() => expect(pending.has(darkTheme)).toBe(true));

    expect(pending.get(theme)?.signal?.aborted).toBe(true);

    const currentTokens = [[{ content: 'source', offset: 0, color: '#ffffff' }]];

    await act(async () => pending.get(darkTheme)?.resolve(currentTokens));

    await act(async () =>
      pending.get(theme)?.resolve([[{ content: 'source', offset: 0, color: '#000000' }]]),
    );

    expect(result.current).toBe(currentTokens);
  });
});
