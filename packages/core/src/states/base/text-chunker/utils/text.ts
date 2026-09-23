import type { IRawPatchItem } from '@fluxdown/types';
import type { Marked, Token } from 'marked';

import { keys, last } from 'lodash-es';

import type { IBlockSection, TextChunkerConfig } from '../type';

import { trackHtmlContainers } from './html';
import { DISPLAY_MATH_TOKEN, getMarkdownLexer } from './lexer';
import { chunkPatchesByTexts } from './patches';
import { getTableLength } from './table';

export const buildBlockSections = ([currentTexts, currentPatches]: [
  string[],
  IRawPatchItem[],
]): IBlockSection[] => {
  const patchGroups = chunkPatchesByTexts(currentPatches, currentTexts);

  return currentTexts.map((text, index) => ({
    text,
    patches: patchGroups[index] ?? [],
  }));
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

const hasDocumentScopedSyntax = (token: Token): boolean => {
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
    return hasFootnoteReference(tree.raw);
  }

  if (tree.tokens?.some(hasDocumentScopedSyntax)) {
    return true;
  }

  if (tree.items?.some((item) => item.tokens.some(hasDocumentScopedSyntax))) {
    return true;
  }

  const tableCells = [...(tree.header ?? []), ...(tree.rows?.flat() ?? [])];
  return tableCells.some((cell) => cell.tokens.some(hasDocumentScopedSyntax));
};

type NormalizedMarkdown = {
  markdown: string;
  originalOffsets?: number[];
};

const normalizeLineEndings = (text: string): NormalizedMarkdown => {
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

type RootToken = {
  token: Token;
  start: number;
  end: number;
};

type RootTokenResult = {
  hasDocumentSyntax: boolean;
  rootTokens: RootToken[];
};

const readRootTokens = (
  markdown: string,
  markdownLexer: Marked,
  config: TextChunkerConfig,
): RootTokenResult | undefined => {
  const rootTokens: RootToken[] = [];
  let hasDocumentSyntax = false;
  let cursor = 0;

  while (cursor < markdown.length) {
    const tokens = markdownLexer.lexer(markdown.slice(cursor));

    if (tokens.length === 0) {
      return undefined;
    }

    hasDocumentSyntax ||= keys(tokens.links).length > 0;

    for (const token of tokens) {
      if (token.raw.length === 0 || !markdown.startsWith(token.raw, cursor)) {
        return undefined;
      }

      const length =
        token.type === 'table'
          ? getTableLength(markdown.slice(cursor), markdownLexer, config)
          : token.raw.length;

      // Preserve marked's ownership of whitespace between blocks.
      const changed =
        length !== token.raw.length &&
        !/^[\t \n]*$/.test(
          markdown.slice(
            cursor + Math.min(length, token.raw.length),
            cursor + Math.max(length, token.raw.length),
          ),
        );
      const raw = changed ? markdown.slice(cursor, cursor + length) : token.raw;

      hasDocumentSyntax ||= changed
        ? markdownLexer.lexer(raw).some(hasDocumentScopedSyntax)
        : hasDocumentScopedSyntax(token);

      rootTokens.push({
        token: changed ? { ...token, raw } : token,
        start: cursor,
        end: cursor + raw.length,
      });

      cursor += raw.length;

      if (changed) {
        // Resume at the real boundary: a math or list block may extend beyond the
        // token that marked originally classified as table rows.
        break;
      }
    }
  }

  return { hasDocumentSyntax, rootTokens };
};

const isPandocMath = (token: Token): boolean =>
  token.type === DISPLAY_MATH_TOKEN && /^ {0,3}\\\[/.test(token.raw);

const needsPreviousContext = (
  previous: Token | undefined,
  current: Token,
  markdownLexer: Marked,
  separated: boolean,
): boolean => {
  // The parser still treats a non-one ordered marker after indented code as text.
  if (
    previous?.type === 'code' &&
    previous.codeBlockStyle === 'indented' &&
    current.type === 'list' &&
    current.ordered &&
    current.start !== 1
  ) {
    return true;
  }

  if (!previous || separated || /\n[\t ]*\n[\t ]*$/.test(previous.raw)) {
    return false;
  }

  if (isPandocMath(current)) {
    return previous.type === 'paragraph' || isPandocMath(previous);
  }

  // Pandoc delimiters are inline syntax: keep any non-interrupting following content
  // in the same section rather than turning it into a new standalone block.
  return (
    isPandocMath(previous) && (markdownLexer.lexer(`x\n${current.raw}`)[0]?.raw.length ?? 0) > 2
  );
};

/**
 * Chunks Markdown at root block boundaries while preserving the source exactly.
 */
export const chunkTextOfMarkdown = (
  text: string,
  config: TextChunkerConfig = { indentedCode: true, setextHeading: true, tex: true },
): string[] => {
  if (text === '') {
    return [];
  }

  const { markdown, originalOffsets } = normalizeLineEndings(text);
  const markdownLexer = getMarkdownLexer(config);

  const result = readRootTokens(markdown, markdownLexer, config);

  if (!result) {
    return [text];
  }

  const { hasDocumentSyntax, rootTokens } = result;

  if (hasDocumentSyntax) {
    return [text];
  }

  const spans: Array<{ start: number; end: number }> = [];

  const containers: string[] = [];

  let previousToken: Token | undefined;

  for (const [index, { token, start, end }] of rootTokens.entries()) {
    const previous = last(spans);

    const insideContainer = containers.length > 0;

    const needsContext = needsPreviousContext(
      previousToken,
      token,
      markdownLexer,
      rootTokens[index - 1]?.token.type === 'space',
    );

    if (token.type !== 'space') {
      previousToken = token;
    }

    trackHtmlContainers(token, containers);

    if (token.type === 'space' || (previous && (insideContainer || needsContext))) {
      if (previous) {
        previous.end = end;
      }

      continue;
    }

    spans.push({
      start: spans.length === 0 ? 0 : start,
      end,
    });
  }

  if (spans.length === 0) {
    return [text];
  }

  return spans.map(({ start, end }) => {
    return text.slice(originalOffsets?.[start] ?? start, originalOffsets?.[end] ?? end);
  });
};
