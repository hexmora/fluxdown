import { computed, shallowRef, watch } from 'vue';

import type { CodeToken } from './utils';

import { highlightCode } from './utils';

interface HighlightedCode {
  code: string;

  language: string;

  tokens: CodeToken[][];
}

export const useHighlighted = (source: () => { code: string; language?: string }) => {
  const highlighted = shallowRef<HighlightedCode | null>(null);

  watch(
    () => [source().code, source().language ?? 'plaintext'] as const,
    ([code, language], _, onCleanup) => {
      let active = true;

      onCleanup(() => {
        active = false;
      });

      void highlightCode(code, language).then(
        (tokens) => {
          if (active && tokens) highlighted.value = { code, language, tokens };
        },
        (error: unknown) => {
          console.error(error);
        },
      );
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
