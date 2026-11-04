import type { Token, TokenStream } from 'prismjs';

import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

export interface CodeToken {
  text: string;

  type?: string;
}

const flattenToken = (token: string | Token, inherited?: string): CodeToken[] => {
  if (typeof token === 'string') {
    return [{ text: token, type: inherited }];
  }

  return flattenTokens(token.content, token.type);
};

const flattenTokens = (tokens: TokenStream, inherited?: string): CodeToken[] => {
  if (!Array.isArray(tokens)) {
    return flattenToken(tokens, inherited);
  }

  return tokens.flatMap((token) => flattenToken(token, inherited));
};

export const highlight = (code: string, language = 'plaintext'): CodeToken[] => {
  const grammar = Prism.languages[language];

  return grammar ? flattenTokens(Prism.tokenize(code, grammar)) : [{ text: code }];
};

export const toCodeLines = (tokens: CodeToken[]): CodeToken[][] => {
  const lines: CodeToken[][] = [[]];

  for (const token of tokens) {
    const fragments = token.text.split('\n');

    for (let index = 0; index < fragments.length; index += 1) {
      if (index > 0) {
        lines.push([]);
      }

      if (fragments[index]) {
        lines[lines.length - 1].push({ text: fragments[index], type: token.type });
      }
    }
  }

  return lines;
};
