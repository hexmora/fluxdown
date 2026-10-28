import type { TokenStream } from 'prismjs';

import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';

interface HighlightedCode {
  code: string;

  language: string;

  tokens: TokenStream;
}

export const createHighlighted = (source: () => { code: string; language?: string }) => {
  const [highlighted, setHighlighted] = createSignal<HighlightedCode | null>(null);

  createEffect(() => {
    const { code, language = 'plaintext' } = source();

    const controller = new AbortController();

    onCleanup(() => controller.abort());

    async function highlight() {
      try {
        const { highlightCode } = await import('./utils');

        const tokens = await highlightCode(code, language, controller.signal);

        if (!controller.signal.aborted && tokens !== null) {
          setHighlighted({ code, language, tokens });
        }
      } catch {
        // Keep the source readable when an optional language chunk cannot load.
      }
    }

    void highlight();
  });

  return createMemo(() => {
    const current = source();

    const value = highlighted();

    return value?.code === current.code && value.language === (current.language ?? 'plaintext')
      ? value.tokens
      : null;
  });
};
