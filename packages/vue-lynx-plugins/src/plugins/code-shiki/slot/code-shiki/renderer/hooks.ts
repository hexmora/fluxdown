import type { HighlighterCore } from 'shiki/core';

import { onScopeDispose, shallowRef } from 'vue';

import { createCodeHighlighter } from './utils';

export const useHighlighter = () => {
  const highlighter = shallowRef<HighlighterCore | null>(null);

  let active = true;

  void createCodeHighlighter().then(
    (value) => {
      if (active) highlighter.value = value;
    },
    (error: unknown) => {
      console.error(error);
    },
  );

  onScopeDispose(() => {
    active = false;
  });

  return highlighter;
};
