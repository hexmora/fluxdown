import { memoize } from 'lodash-es';
import { Marked } from 'marked';

import type { TextChunkerConfig } from '../type';

export const DISPLAY_MATH_TOKEN = 'fluxdown_display_math';

const readDisplayMath = (source: string, indentedCode: boolean): string | undefined => {
  const opening = /^([\t ]*)(\${2,}|\\\[)([^\n]*)(\n|$)/.exec(source);

  if (!opening) {
    return undefined;
  }

  const marker = opening[2];
  const restOfOpeningLine = opening[3];
  const openingRaw = opening[0];
  const isDollar = marker.startsWith('$');
  const limitedIndent = indentedCode || !isDollar;

  if (limitedIndent && !/^ {0,3}$/.test(opening[1])) {
    return undefined;
  }

  if (isDollar ? restOfOpeningLine.includes('$') : restOfOpeningLine.trim() !== '') {
    return undefined;
  }

  let lineStart = openingRaw.length;

  while (lineStart < source.length) {
    const newline = source.indexOf('\n', lineStart);
    const lineEnd = newline < 0 ? source.length : newline;
    const line = source.slice(lineStart, lineEnd);
    const closing = /^([\t ]*)(\${2,}|\\\])[\t ]*$/.exec(line);

    if (
      closing &&
      (!limitedIndent || /^ {0,3}$/.test(closing[1])) &&
      (isDollar
        ? closing[2].startsWith('$') && closing[2].length >= marker.length
        : closing[2] === '\\]')
    ) {
      return source.slice(0, newline < 0 ? lineEnd : newline + 1);
    }

    if (newline < 0) {
      break;
    }

    lineStart = newline + 1;
  }

  return source;
};

export const getMarkdownLexer: (config: TextChunkerConfig) => Marked = /*#__PURE__*/ memoize(
  (config: TextChunkerConfig) =>
    /*#__PURE__*/ new Marked({
      tokenizer: {
        code: () => (config.indentedCode ? false : undefined),
        lheading: () => (config.setextHeading ? false : undefined),
      },
      gfm: true,
      extensions: config.tex
        ? [
            {
              name: DISPLAY_MATH_TOKEN,
              level: 'block',
              start(source) {
                const pattern = config.indentedCode
                  ? /\n(?: {0,3}\${2,}[^$\n]*(?=\n|$)| {0,3}\\\[[^\S\n]*(?=\n|$))/
                  : /\n(?:[\t ]*\${2,}[^$\n]*(?=\n|$)| {0,3}\\\[[^\S\n]*(?=\n|$))/;
                const match = pattern.exec(source);

                if (!match) {
                  return undefined;
                }

                return match.index + 1;
              },
              tokenizer(source) {
                const raw = readDisplayMath(source, config.indentedCode);

                if (!raw) {
                  return undefined;
                }

                return {
                  type: DISPLAY_MATH_TOKEN,
                  raw,
                  text: raw,
                };
              },
            },
          ]
        : [],
    }),
  ({ indentedCode, setextHeading, tex }) => `${indentedCode}:${setextHeading}:${tex}`,
);
