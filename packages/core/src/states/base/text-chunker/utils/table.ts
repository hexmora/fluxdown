import type { Marked } from 'marked';

import { trimStart } from 'lodash-es';

import type { TextChunkerConfig } from '../type';

import { DISPLAY_MATH_TOKEN } from './lexer';

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const TABLE_INTERRUPT_TOKENS = ['blockquote', 'code', 'heading', 'hr', 'html', 'list'];

/** GFM table rows continue until a blank line or another flow block starts. */
export const getTableLength = (
  source: string,
  markdownLexer: Marked,
  config: TextChunkerConfig,
): number => {
  let lineStart = 0;
  let lineNumber = 0;

  while (lineStart < source.length) {
    const newline = source.indexOf('\n', lineStart);
    const lineEnd = newline < 0 ? source.length : newline;
    const line = source.slice(lineStart, lineEnd);

    if (lineNumber >= 2) {
      if (/^[\t ]*$/.test(line)) {
        return lineStart;
      }

      // Without indented code, micromark allows flow constructs at any indentation.
      const content = config.indentedCode ? line : trimStart(line, '\t ');
      const token = markdownLexer.lexer(content)[0];

      if (
        token &&
        (TABLE_INTERRUPT_TOKENS.includes(token.type) ||
          (token.type === DISPLAY_MATH_TOKEN && /^ {0,3}\$\$/.test(content)))
      ) {
        return lineStart;
      }
    }

    lineNumber += 1;
    lineStart = newline < 0 ? source.length : newline + 1;
  }

  return source.length;
};
