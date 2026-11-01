import { computed, effect, signal } from '@angular/core';

import type { HighlightedCode } from './type';

export const createHighlighted = (source: () => { code: string; language?: string }) => {
  const highlighted = signal<HighlightedCode | null>(null);

  const code = computed(() => source().code);

  const language = computed(() => source().language ?? 'plaintext');

  effect((cleanup) => {
    const currentCode = code();

    const currentLanguage = language();

    const controller = new AbortController();

    cleanup(() => controller.abort());

    async function highlight() {
      try {
        const { highlightCode } = await import('./utils');

        const tokens = await highlightCode(currentCode, currentLanguage, controller.signal);

        if (!controller.signal.aborted && tokens !== null) {
          highlighted.set({ code: currentCode, language: currentLanguage, tokens });
        }
      } catch {
        // Keep the source readable when an optional language chunk cannot load.
      }
    }

    void highlight();
  });

  return computed<HighlightedCode['tokens'] | null>(() => {
    const current = source();

    const value = highlighted();

    return value?.code === current.code && value.language === (current.language ?? 'plaintext')
      ? value.tokens
      : null;
  });
};
