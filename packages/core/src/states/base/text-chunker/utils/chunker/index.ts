import type { Marked, Token } from 'marked';

import { keys, last, trimStart } from 'lodash-es';

import type { TextChunkerConfig } from '../../type';

import {
  alignRootToken,
  createMarkdownLexer,
  DISPLAY_MATH_TOKEN,
  getLexerPolicyKey,
  getTokenBoundary,
  hasDocumentScopedSyntax,
  hasUnclosedDefinition,
  hasUnfinishedMathStart,
  isPandocMath,
  normalizeLineEndings,
  type TokenBoundary,
} from './utils';

const DEFAULT_CONFIG: TextChunkerConfig = { indentedCode: true, setextHeading: true, tex: true };

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const VOID_TAGS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const RAW_TEXT_TAGS = [
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
  'script',
  'style',
  'textarea',
  'title',
  'xmp',
];

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const TABLE_INTERRUPT_TOKENS = ['blockquote', 'code', 'heading', 'hr', 'html', 'list'];

type RootToken = {
  token: Token;
  start: number;
  end: number;
};

type RootTokenResult = {
  hasDocumentSyntax: boolean;
  rootTokens: RootToken[];
};

type MarkdownCheckpoint = {
  count: number;
  length: number;
};

type MarkdownChunks = {
  texts: string[];
  checkpoint?: MarkdownCheckpoint;
};

type MarkdownSnapshot = MarkdownChunks & {
  text: string;
  lexer: Marked;
};

/** Reuses a sealed prefix while rescanning the tail in its original block context. */
export class LexerChunker {
  private config!: TextChunkerConfig;

  private lexer!: Marked;

  private policyKey: string | undefined;

  private previous: MarkdownSnapshot | undefined;

  private containers: string[] = [];

  chunk(text: string, config: TextChunkerConfig = DEFAULT_CONFIG): string[] {
    this.configure(config);

    const retained =
      this.previous?.lexer === this.lexer && text.startsWith(this.previous.text)
        ? this.previous
        : undefined;

    const checkpoint = retained?.checkpoint;

    const tail = this.readMarkdownChunks(text.slice(checkpoint?.length ?? 0));

    if (!tail) {
      // Definitions, footnotes, and uncertain token alignment require document scope.
      const full = checkpoint ? this.readMarkdownChunks(text) : undefined;

      this.previous = { text, lexer: this.lexer, ...(full ?? { texts: [text] }) };

      return this.previous.texts;
    }

    const texts =
      retained && checkpoint
        ? [...retained.texts.slice(0, checkpoint.count), ...tail.texts]
        : tail.texts;

    this.previous = {
      text,
      lexer: this.lexer,
      texts,
      checkpoint: tail.checkpoint
        ? {
            count: (checkpoint?.count ?? 0) + tail.checkpoint.count,
            length: (checkpoint?.length ?? 0) + tail.checkpoint.length,
          }
        : checkpoint,
    };

    return texts;
  }

  private configure(config: TextChunkerConfig): void {
    const key = getLexerPolicyKey(config);

    this.config = config;

    if (this.policyKey === key) {
      return;
    }

    this.lexer = createMarkdownLexer(config);

    this.policyKey = key;
  }

  private readMarkdownChunks(text: string): MarkdownChunks | undefined {
    if (text === '') {
      return { texts: [] };
    }

    const { markdown, originalOffsets } = normalizeLineEndings(text);

    const result = this.readRootTokens(markdown);

    if (!result) {
      return undefined;
    }

    const { hasDocumentSyntax, rootTokens } = result;

    if (hasDocumentSyntax) {
      return undefined;
    }

    const spans: Array<{ start: number; end: number; boundary?: TokenBoundary }> = [];

    this.containers = [];

    let previousToken: Token | undefined;

    // An unfinished extension opener can disappear when its line receives more text.
    // Until then, marked's paragraph clipping before it is also provisional.
    let stableLength = hasUnfinishedMathStart(markdown, this.config) ? 0 : markdown.length;

    for (const [index, { token, start, end }] of rootTokens.entries()) {
      const previous = last(spans);

      const preceding = rootTokens[index - 1];

      // A later extension can make marked join consecutive paragraph tokens that
      // its base grammar split. Keep that ambiguous boundary in the scanned tail.
      if (this.config.tex && token.type === 'paragraph' && preceding?.token.type === 'paragraph') {
        stableLength = Math.min(stableLength, preceding.start);
      }

      // Marked accepts reference labels across blank lines. An unfinished label
      // can become a document definition after later blocks have already arrived.
      if (hasUnclosedDefinition(token)) {
        stableLength = Math.min(stableLength, start);
      }

      const insideContainer = this.containers.length > 0;

      const needsContext = this.needsPreviousContext(
        previousToken,
        token,
        rootTokens[index - 1]?.token.type === 'space',
      );

      if (token.type !== 'space') {
        previousToken = token;
      }

      this.trackHtmlContainers(token);

      if (token.type === 'space' || (previous && (insideContainer || needsContext))) {
        if (previous) {
          previous.end = end;

          if (token.type !== 'space') {
            previous.boundary = this.containers.length === 0 ? getTokenBoundary(token) : undefined;
          }
        }

        continue;
      }

      spans.push({
        start: spans.length === 0 ? 0 : start,
        end,
        boundary: this.containers.length === 0 ? getTokenBoundary(token) : undefined,
      });
    }

    if (spans.length === 0) {
      return undefined;
    }

    let checkpoint: MarkdownCheckpoint | undefined;

    const texts = spans.map(({ start, end, boundary }, index) => {
      const originalEnd = originalOffsets?.[end] ?? end;

      // Retain the final section to preserve its ownership of appended whitespace.
      // Lists and indented code may continue across blank lines, so neither seals a prefix.
      if (
        boundary &&
        index < spans.length - 1 &&
        end <= stableLength &&
        (boundary === 'line' ? /\n[\t \n]*$/ : /\n[\t ]*\n[\t \n]*$/).test(
          markdown.slice(start, end),
        )
      ) {
        checkpoint = { count: index + 1, length: originalEnd };
      }

      return text.slice(originalOffsets?.[start] ?? start, originalEnd);
    });

    return { texts, checkpoint };
  }

  private readRootTokens(markdown: string): RootTokenResult | undefined {
    const rootTokens: RootToken[] = [];
    let hasDocumentSyntax = false;
    let cursor = 0;

    while (cursor < markdown.length) {
      const tokens = this.lexer.lexer(markdown.slice(cursor));

      if (tokens.length === 0) {
        return undefined;
      }

      hasDocumentSyntax ||= keys(tokens.links).length > 0;

      for (const currentToken of tokens) {
        const token = alignRootToken(currentToken, markdown, cursor, currentToken === last(tokens));

        if (!token) {
          return undefined;
        }

        const length =
          token.type === 'table' ? this.getTableLength(markdown.slice(cursor)) : token.raw.length;

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
          ? this.lexer.lexer(raw).some(hasDocumentScopedSyntax)
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
  }

  private needsPreviousContext(
    previous: Token | undefined,
    current: Token,
    separated: boolean,
  ): boolean {
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
      isPandocMath(previous) && (this.lexer.lexer(`x\n${current.raw}`)[0]?.raw.length ?? 0) > 2
    );
  }

  /** GFM table rows continue until a blank line or another flow block starts. */
  private getTableLength(source: string): number {
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
        const content = this.config.indentedCode ? line : trimStart(line, '\t ');
        const token = this.lexer.lexer(content)[0];

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
  }

  /** Track HTML containers across blocks without inspecting code or escaped text. */
  private trackHtmlContainers(token: Token): void {
    if (token.type !== 'html') {
      if ((token.type === 'paragraph' || token.type === 'text') && token.tokens) {
        token.tokens.forEach((child) => this.trackHtmlContainers(child));
      }

      return;
    }

    const tags = token.raw.matchAll(
      /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<\?[\s\S]*?(?:\?>|$)|<![^>]*(?:>|$)|<\/?([A-Za-z][\w:-]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*>/g,
    );

    for (const match of tags) {
      const tag = match[1]?.toLowerCase();

      if (!tag) {
        continue;
      }

      const closing = match[0].startsWith('</');

      const current = last(this.containers);

      if (current && RAW_TEXT_TAGS.includes(current) && (!closing || tag !== current)) {
        continue;
      }

      if (closing) {
        const index = this.containers.lastIndexOf(tag);

        if (index >= 0) {
          this.containers.length = index;
        }
      } else if (!VOID_TAGS.includes(tag)) {
        this.containers.push(tag);
      }
    }
  }
}
