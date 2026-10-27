import { computed, shallowRef, watch } from 'vue';

import type { HighlightedCode } from './type';

export const useHighlighted = (source: () => { code: string; language?: string }) => {
  const highlighted = shallowRef<HighlightedCode | null>(null);

  watch(
    () => [source().code, source().language ?? 'plaintext'] as const,
    ([code, language], _, onCleanup) => {
      const controller = new AbortController();

      onCleanup(() => controller.abort());

      async function highlight() {
        try {
          const { highlightCode } = await import('./utils');

          const tokens = await highlightCode(code, language, controller.signal);

          if (!controller.signal.aborted && tokens !== null) {
            highlighted.value = { code, language, tokens };
          }
        } catch {
          // Keep the source readable when an optional language chunk cannot load.
        }
      }

      void highlight();
    },
    { immediate: true },
  );

  return computed(() => {
    const current = source();

    return highlighted.value?.code === current.code &&
      highlighted.value.language === (current.language ?? 'plaintext')
      ? highlighted.value.tokens
      : null;
  });
};
