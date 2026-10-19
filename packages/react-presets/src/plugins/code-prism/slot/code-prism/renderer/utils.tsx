import type { Token, TokenStream } from 'prismjs';
import type { ReactNode } from 'react';

import Prism from 'prismjs';

// React owns the code DOM; Prism only supplies token trees.
Prism.manual = true;

const renderTokens = (tokens: TokenStream): ReactNode => {
  if (typeof tokens === 'string') {
    return tokens;
  }

  const items: (string | Token)[] = Array.isArray(tokens) ? tokens : [tokens];

  let offset = 0;

  return items.map((token) => {
    const key = offset;
    offset += token.length;

    if (typeof token === 'string') {
      return token;
    }

    return (
      <span className={['token', token.type, ...[token.alias ?? []].flat()].join(' ')} key={key}>
        {renderTokens(token.content)}
      </span>
    );
  });
};

export const highlightCode = (code: string, language: string): ReactNode => {
  const name = language.toLowerCase();
  const grammar = Object.hasOwn(Prism.languages, name) ? Prism.languages[name] : undefined;

  if (!grammar || typeof grammar !== 'object') {
    return code;
  }

  return renderTokens(Prism.tokenize(code, grammar));
};
