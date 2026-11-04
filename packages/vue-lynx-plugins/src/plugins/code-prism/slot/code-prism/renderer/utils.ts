import type { CSSProperties } from '@lynx-js/types';
import type { hooks, TokenStream } from 'prismjs';

import { castArray, has, isObjectLike, isString, toLower, trim } from 'lodash-es';

import type { ThemeTokens } from '../../../../../base/theme';

import './languages';
import Prism from './runtime';

export interface CodeToken {
  content: string;

  types: string[];
}

const getGrammar = (language: string) => {
  const grammar = has(Prism.languages, [language]) ? Prism.languages[language] : undefined;

  return isObjectLike(grammar) ? grammar : null;
};

const splitTokens = (tokens: TokenStream) => {
  const lines: CodeToken[][] = [[]];

  const append = (stream: TokenStream, types: string[]) => {
    if (isString(stream)) {
      stream.split('\n').forEach((content, index) => {
        if (index > 0) lines.push([]);

        if (content) lines[lines.length - 1].push({ content, types });
      });

      return;
    }

    for (const token of castArray(stream)) {
      if (isString(token)) {
        append(token, types);
      } else {
        append(token.content, [...types, token.type, ...castArray(token.alias ?? [])]);
      }
    }
  };

  append(tokens, []);

  return lines;
};

export const highlightCode = async (code: string, language: string) => {
  const name = toLower(trim(language));

  if (!name || getGrammar(name) === Prism.languages.plaintext) return null;

  const grammar = getGrammar(name);

  if (!grammar) return null;

  const environment: hooks.TokenizeEnvironment = {
    code: code.replace(/\t/g, '  '),
    grammar,
    language: name,
  };

  Prism.hooks.run('before-tokenize', environment);

  environment.tokens = Prism.tokenize(environment.code, environment.grammar);

  Prism.hooks.run('after-tokenize', environment);

  return splitTokens(environment.tokens);
};

export const tokenStyle = (types: string[], { syntax }: ThemeTokens): CSSProperties => {
  const colors: Record<string, string> = {
    comment: syntax.comment,
    prolog: syntax.comment,
    doctype: syntax.comment,
    cdata: syntax.comment,
    keyword: syntax.keyword,
    atrule: syntax.keyword,
    string: syntax.string,
    char: syntax.string,
    'attr-value': syntax.string,
    tag: syntax.string,
    number: syntax.number,
    boolean: syntax.number,
    constant: syntax.number,
    function: syntax.function,
    'class-name': syntax.function,
    property: syntax.variable,
    variable: syntax.variable,
    'attr-name': syntax.variable,
    punctuation: syntax.punctuation,
    operator: syntax.punctuation,
    inserted: syntax.inserted,
    deleted: syntax.deleted,
  };

  const style: CSSProperties = {};

  for (const type of types) {
    if (has(colors, [type])) style.color = colors[type];

    if (type === 'bold') style.fontWeight = '700';

    if (type === 'italic') style.fontStyle = 'italic';
  }

  return style;
};
