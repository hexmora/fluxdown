import type { HighlighterCore } from 'shiki/core';

import { useEffect, useState } from '@lynx-js/react';

import { createCodeHighlighter } from './utils';

export const useHighlighter = () => {
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null);

  useEffect(() => {
    let active = true;

    void createCodeHighlighter().then(
      (value) => {
        if (active) setHighlighter(value);
      },
      (error: unknown) => {
        console.error(error);
      },
    );

    return () => {
      active = false;
    };
  }, []);

  return highlighter;
};
