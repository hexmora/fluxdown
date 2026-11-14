import type { Token } from 'marked';

import { trimEnd } from 'lodash-es';
import { Marked } from 'marked';

import type { TextChunkerConfig } from '../../type';

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

export const findDisplayMathStart = (source: string, indentedCode: boolean): number | undefined => {
  const pattern = indentedCode
    ? /\n(?: {0,3}\${2,}[^$\n]*(?=\n|$)| {0,3}\\\[[^\S\n]*(?=\n|$))/
    : /\n(?:[\t ]*\${2,}[^$\n]*(?=\n|$)| {0,3}\\\[[^\S\n]*(?=\n|$))/;

  const match = pattern.exec(source);

  return match ? match.index + 1 : undefined;
};

export const getLexerPolicyKey = ({
  indentedCode,
  setextHeading,
  tex,
}: TextChunkerConfig): string => `${indentedCode}:${setextHeading}:${tex}`;

export const createMarkdownLexer = ({
  indentedCode,
  setextHeading,
  tex,
}: TextChunkerConfig): Marked =>
  /*#__PURE__*/ new Marked({
    tokenizer: {
      code: () => (indentedCode ? false : undefined),
      lheading: () => (setextHeading ? false : undefined),
    },
    gfm: true,
    extensions: tex
      ? [
          {
            name: DISPLAY_MATH_TOKEN,
            level: 'block',
            start(source) {
              return findDisplayMathStart(source, indentedCode);
            },
            tokenizer(source) {
              const raw = readDisplayMath(source, indentedCode);

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
  });

export type TokenBoundary = 'line' | 'blank';

/** The separator needed before later text can no longer extend this block. */
export const getTokenBoundary = (token: Token): TokenBoundary | undefined => {
  if (
    token.type === 'heading' ||
    token.type === 'hr' ||
    (token.type === 'code' && token.codeBlockStyle !== 'indented')
  ) {
    return 'line';
  }

  if (token.type === DISPLAY_MATH_TOKEN) {
    return /^ {0,3}\\\[/.test(token.raw) ? 'blank' : 'line';
  }

  if (token.type === 'paragraph' || token.type === 'table') {
    return 'blank';
  }

  return undefined;
};

export const hasUnclosedDefinition = (token: Token): boolean => {
  return token.type === 'paragraph' && /^ {0,3}\[(?:\\[\s\S]|[^[\]\\])*$/.test(token.raw);
};

export const hasUnfinishedMathStart = (markdown: string, config: TextChunkerConfig): boolean => {
  if (!config.tex || markdown.endsWith('\n')) {
    return false;
  }

  const line = markdown.slice(markdown.lastIndexOf('\n') + 1);

  return findDisplayMathStart(`\n${line}`, config.indentedCode) !== undefined;
};

type TokenTree = {
  type: string;
  raw: string;
  tokens?: Token[];
  items?: Array<{ tokens: Token[] }>;
  header?: Array<{ tokens: Token[] }>;
  rows?: Array<Array<{ tokens: Token[] }>>;
};

const hasFootnoteReference = (text: string): boolean => {
  let opening = text.indexOf('[^');

  while (opening >= 0) {
    let size = 0;

    for (let index = opening + 2; index < text.length; index += 1) {
      const character = text[index];

      if (character === ']') {
        if (size > 0) {
          return true;
        }

        break;
      }

      if (
        character === '[' ||
        character === ' ' ||
        character === '\t' ||
        character === '\n' ||
        size >= 1_000
      ) {
        break;
      }

      if (character === '\\' && /[[\]\\]/.test(text[index + 1] ?? '')) {
        index += 1;
      }

      size += 1;
    }

    opening = text.indexOf('[^', opening + 2);
  }

  return false;
};

/** Explicit references need later definitions even before the lexer can resolve them. */
const hasExplicitReference = (source: string): boolean => {
  if (!source.includes('][')) {
    return false;
  }

  const openers: number[] = [];

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '\\') {
      index += 1;

      continue;
    }

    if (character === '[') {
      openers.push(index);

      continue;
    }

    if (character !== ']') {
      continue;
    }

    const opener = openers.pop();

    if (opener === undefined || opener + 1 === index || source[index + 1] !== '[') {
      continue;
    }

    const start = index + 2;

    for (let end = start; end < source.length && end - start <= 999; end += 1) {
      if (source[end] === '\\') {
        end += 1;
      } else if (source[end] === '[') {
        break;
      } else if (source[end] === ']') {
        const identifier = source.slice(start, end) || source.slice(opener + 1, index);

        if (/[^\t\n\r ]/.test(identifier) && !/\n[ \t]*\n/.test(identifier)) {
          return true;
        }

        break;
      }
    }
  }

  return false;
};

const hasDocumentScopedTokens = (tokens: Token[]): boolean => {
  // Keep parsed code, HTML and links opaque, but allow formatting inside an outer label.
  const source = tokens
    .map((token) =>
      (token.type === 'text' && !('tokens' in token && token.tokens?.length)) ||
      token.type === 'escape'
        ? token.raw
        : '\0'.repeat(token.raw.length),
    )
    .join('');

  return hasExplicitReference(source) || tokens.some(hasDocumentScopedSyntax);
};

export const hasDocumentScopedSyntax = (token: Token): boolean => {
  const tree = token as TokenTree;

  if (
    tree.type === 'code' ||
    tree.type === 'codespan' ||
    tree.type === 'image' ||
    tree.type === 'link' ||
    tree.type === DISPLAY_MATH_TOKEN
  ) {
    return false;
  }

  if (tree.type === 'def') {
    return true;
  }

  if (tree.type === 'text' && (!tree.tokens || tree.tokens.length === 0)) {
    return hasFootnoteReference(tree.raw) || hasExplicitReference(tree.raw);
  }

  if (tree.tokens && hasDocumentScopedTokens(tree.tokens)) {
    return true;
  }

  if (tree.items?.some((item) => hasDocumentScopedTokens(item.tokens))) {
    return true;
  }

  const tableCells = [...(tree.header ?? []), ...(tree.rows?.flat() ?? [])];
  return tableCells.some((cell) => hasDocumentScopedTokens(cell.tokens));
};

type NormalizedMarkdown = {
  markdown: string;
  originalOffsets?: number[];
};

export const normalizeLineEndings = (text: string): NormalizedMarkdown => {
  if (!text.includes('\r')) {
    return { markdown: text };
  }

  let markdown = '';
  const originalOffsets = [0];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\r') {
      if (text[index + 1] === '\n') {
        index += 1;
      }

      markdown += '\n';
    } else {
      markdown += text[index];
    }

    originalOffsets.push(index + 1);
  }

  return { markdown, originalOffsets };
};

export const alignRootToken = (
  token: Token,
  markdown: string,
  cursor: number,
  isLast: boolean,
): Token | undefined => {
  if (token.raw.length === 0) {
    return undefined;
  }

  if (markdown.startsWith(token.raw, cursor)) {
    return token;
  }

  if (token.type !== 'list' || !isLast) {
    return undefined;
  }

  const raw = markdown.slice(cursor);

  if (trimEnd(token.raw) !== trimEnd(raw)) {
    return undefined;
  }

  // Marked may replace trailing list whitespace with a newline at EOF.
  return { ...token, raw };
};

export const isPandocMath = (token: Token): boolean =>
  token.type === DISPLAY_MATH_TOKEN && /^ {0,3}\\\[/.test(token.raw);
