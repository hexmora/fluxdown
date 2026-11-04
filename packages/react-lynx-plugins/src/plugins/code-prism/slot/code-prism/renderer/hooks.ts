import { useEffect, useState } from '@lynx-js/react';

import type { CodeToken } from './utils';

import { highlightCode } from './utils';

interface HighlightedCode {
  code: string;

  language: string;

  tokens: CodeToken[][];
}

export const useHighlighted = (code: string, language: string) => {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useEffect(() => {
    let active = true;

    void highlightCode(code, language).then(
      (tokens) => {
        if (active && tokens) setHighlighted({ code, language, tokens });
      },
      (error: unknown) => {
        console.error(error);
      },
    );

    return () => {
      active = false;
    };
  }, [code, language]);

  return highlighted?.code === code && highlighted.language === language
    ? highlighted.tokens
    : null;
};
