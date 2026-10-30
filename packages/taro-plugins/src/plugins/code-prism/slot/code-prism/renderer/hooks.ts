import type { ReactNode } from 'react';

import { isNil } from 'lodash-es';
import { useEffect, useState } from 'react';

interface HighlightedCode {
  code: string;
  language: string;
  tokens: ReactNode;
}

export const useHighlighted = (code: string, language: string) => {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const { highlightCode } = await import('./utils');

        if (cancelled) {
          return;
        }

        const tokens = await highlightCode(code, language, () => cancelled);

        if (!cancelled && !isNil(tokens)) {
          setHighlighted({ code, language, tokens });
        }
      } catch {
        // Keep the source readable when an optional language chunk cannot load.
      }
    }

    void highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return highlighted?.code === code && highlighted.language === language
    ? highlighted.tokens
    : null;
};
