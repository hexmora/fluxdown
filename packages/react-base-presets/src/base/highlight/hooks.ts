import { useEffect, useState } from 'react';

import type { HighlightedCode, HighlightedToken, HighlightTheme } from './type';

export const useHighlighted = (
  code: string,
  language: string,
  theme: HighlightTheme,
): HighlightedToken[][] | null => {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function highlight() {
      try {
        const { highlightCode } = await import('./utils');

        const tokens = await highlightCode(code, language, theme, controller.signal);

        if (!controller.signal.aborted && tokens) {
          setHighlighted({ code, language, theme, tokens });
        }
      } catch {
        // Keep the source readable when an optional language chunk cannot load.
      }
    }

    void highlight();

    return () => {
      controller.abort();
    };
  }, [code, language, theme]);

  return highlighted?.code === code &&
    highlighted.language === language &&
    highlighted.theme === theme
    ? highlighted.tokens
    : null;
};
