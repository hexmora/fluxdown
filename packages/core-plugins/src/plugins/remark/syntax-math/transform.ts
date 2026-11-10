import type { Break, Data, Delete, Emphasis, Parent, Root, RootContent, Strong, Text } from 'mdast';
import type { InlineMath } from 'mdast-util-math';

import { findLast } from 'lodash-es';
import { fromMarkdown } from 'mdast-util-from-markdown';

import {
  BLOCK_MATH_PLACEHOLDER,
  INLINE_MATH_PLACEHOLDER,
  MARKDOWN_DECODE_SENTINEL,
  MATH_OPERATOR_PATTERN,
  PANDOC_DISPLAY_CLOSE,
  PANDOC_DISPLAY_OPEN,
  PANDOC_INLINE_CLOSE,
  PANDOC_INLINE_OPEN,
} from './consts';

type PandocMode = 'inline' | 'display';

type ParsedContent = RootContent[];

type MathLiteral = InlineMath | Text | Break | Emphasis | Strong | Delete;

type MathData = Data;

interface SourcedLiteral {
  node: MathLiteral;
  source: string;
  quoteDepth: number;
}

interface ParsedLiteral {
  content: ParsedContent;

  preserveFallback: boolean;
}

const decodeMarkdownText = (value: string): string => {
  const root = fromMarkdown(`${MARKDOWN_DECODE_SENTINEL}${value}${MARKDOWN_DECODE_SENTINEL}`);
  const pending: Array<Root | RootContent> = [root];
  const values: string[] = [];

  while (pending.length > 0) {
    const node = pending.pop();

    if (!node) {
      continue;
    }

    if (node.type === 'text') {
      values.push(node.value);
      continue;
    }

    if ('children' in node) {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        const child = node.children[index];

        if (child) {
          pending.push(child);
        }
      }
    }
  }

  return values.join('').slice(MARKDOWN_DECODE_SENTINEL.length, -MARKDOWN_DECODE_SENTINEL.length);
};

const isEscaped = (value: string, index: number): boolean => {
  let backslashes = 0;

  for (let offset = index - 1; offset >= 0 && value[offset] === '\\'; offset -= 1) {
    backslashes += 1;
  }

  return backslashes % 2 === 1;
};

const countDollarRun = (value: string, index: number): number => {
  let length = 0;

  while (value[index + length] === '$') {
    length += 1;
  }

  return length;
};

const createPlaceholderData = (
  value: string,
  dataType: typeof INLINE_MATH_PLACEHOLDER | typeof BLOCK_MATH_PLACEHOLDER,
  data: MathData = {},
  repairEnding = false,
): MathData => {
  const { source: _source, repairEnding: _repairEnding, ...metadata } = data;

  return {
    ...metadata,
    ...(!repairEnding && _source !== undefined ? { source: _source } : {}),
    ...(repairEnding ? { repairEnding: true } : {}),
    hName: 'span',
    hProperties: {
      dataType,
    },
    hChildren: [{ type: 'text', value, ...(repairEnding ? { data: { repairEnding: true } } : {}) }],
  };
};

const createInlineMath = (
  value: string,
  pandocMode?: PandocMode,
  repairEnding = false,
  source?: string,
): InlineMath => {
  const data: MathData = {
    ...(pandocMode ? { pandocMath: { mode: pandocMode } } : {}),
    ...(source !== undefined ? { source } : {}),
  };

  return {
    type: 'inlineMath',
    value,
    data: createPlaceholderData(
      value,
      pandocMode === 'display' ? BLOCK_MATH_PLACEHOLDER : INLINE_MATH_PLACEHOLDER,
      data,
      repairEnding,
    ),
  };
};

const rawSourceOffset = (literal: SourcedLiteral, offset: number): number => {
  const raw = literal.node.data?.source ?? '';

  if (raw === literal.source) {
    return offset;
  }

  const parts = raw.split(/(\r\n|\r|\n)/);

  let rawOffset = 0;

  let normalizedOffset = 0;

  for (const [index, part] of parts.entries()) {
    const normalized =
      index > 0 && index % 2 === 0
        ? normalizeContainerSource('\n' + part, literal.quoteDepth).slice(1)
        : part;

    if (offset <= normalizedOffset + normalized.length) {
      return rawOffset + part.length - normalized.length + offset - normalizedOffset;
    }

    rawOffset += part.length;

    normalizedOffset += normalized.length;
  }

  return raw.length;
};

const sourceForRange = (nodes: SourcedLiteral[], start: number, end: number): string => {
  const parts: string[] = [];

  let offset = 0;

  for (const literal of nodes) {
    const from = Math.max(0, start - offset);

    const to = Math.min(literal.source.length, end - offset);

    offset += literal.source.length;

    if (from < to) {
      parts.push(
        literal.node.data?.source?.slice(
          rawSourceOffset(literal, from),
          rawSourceOffset(literal, to),
        ) ?? '',
      );
    }
  }

  return parts.join('');
};

const sliceLiteralContent = (
  nodes: SourcedLiteral[],
  start: number,
  end: number,
): ParsedContent => {
  const content: ParsedContent = [];

  let offset = 0;

  for (const literal of nodes) {
    const { node, source } = literal;

    const from = Math.max(0, start - offset);

    const to = Math.min(source.length, end - offset);

    offset += source.length;

    if (from >= to) {
      continue;
    }

    if (from === 0 && to === source.length && node.type !== 'inlineMath') {
      content.push(node);

      continue;
    }

    const raw = sourceForRange([literal], from, to);

    content.push({
      type: 'text',
      value: decodeMarkdownText(source.slice(from, to)),
      data: { source: raw },
    });
  }

  return content;
};

const canOpenMathAt = (nodes: SourcedLiteral[], offset: number): boolean => {
  let start = 0;

  for (const { node, source } of nodes) {
    const end = start + source.length;

    if (offset < end) {
      return node.type === 'text' || node.type === 'inlineMath';
    }

    start = end;
  }

  return false;
};

const getOpeningPadding = (value: string): string | undefined => {
  if (value.startsWith('\r\n')) {
    return '\r\n';
  }

  if (value.startsWith('\n')) {
    return '\n';
  }

  return value.startsWith(' ') ? ' ' : undefined;
};

const getClosingPadding = (value: string): string | undefined => {
  if (value.endsWith('\r\n')) {
    return '\r\n';
  }

  if (value.endsWith('\n')) {
    return '\n';
  }

  return value.endsWith(' ') ? ' ' : undefined;
};

const normalizeClosedDollarValue = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const openingPadding = getOpeningPadding(value);
  const closingPadding = getClosingPadding(value);
  const startsWhitespace = /^\s/.test(value);
  const endsWhitespace = /\s$/.test(value);

  if (startsWhitespace !== endsWhitespace) {
    return undefined;
  }

  if (startsWhitespace && (!openingPadding || openingPadding !== closingPadding)) {
    return undefined;
  }

  const normalized = openingPadding
    ? value.slice(openingPadding.length, -openingPadding.length)
    : value;

  return normalized.trim() === normalized && normalized.length > 0 ? normalized : undefined;
};

const hasTexControlWord = (value: string): boolean => {
  for (let index = 0; index < value.length - 1; index += 1) {
    if (
      value[index] === '\\' &&
      /[A-Za-z]/.test(value[index + 1] ?? '') &&
      !isEscaped(value, index)
    ) {
      return true;
    }
  }

  return false;
};

const normalizeRepairedDollarValue = (
  value: string,
  delimiterLength: number,
  trailingWhitespace = '',
): string | undefined => {
  if (/[\r\n]/.test(value)) {
    return undefined;
  }

  const partialCloser =
    delimiterLength === 2 &&
    trailingWhitespace.length === 0 &&
    value.endsWith('$') &&
    value.at(-2) !== '$' &&
    !isEscaped(value, value.length - 1);

  const candidate = partialCloser ? value.slice(0, -1) : value;

  const normalized = candidate.trim();

  if (!normalized) {
    return '';
  }

  const hasMathSignal =
    normalized.startsWith('\\') ||
    hasTexControlWord(normalized) ||
    MATH_OPERATOR_PATTERN.test(normalized);

  const eligible = !/\s/.test(normalized) || hasMathSignal;

  if (!eligible) {
    return undefined;
  }

  if (/^\s/.test(candidate)) {
    const eligibleDouble = !/\s/.test(normalized);

    if (delimiterLength === 1 ? !hasMathSignal : !eligibleDouble) {
      return undefined;
    }
  }

  return candidate.trimStart();
};

const findPandocClose = (value: string, start: number, close: string): number => {
  for (let index = start; index < value.length - 1; index += 1) {
    if (value.startsWith(close, index) && !isEscaped(value, index)) {
      return index;
    }
  }

  return -1;
};

class DollarCloseFinder {
  private adjacentValidity: Array<boolean | undefined> = [];

  private inlineResults: Array<number | undefined> = [];

  constructor(
    private value: string,
    private repairEnding: boolean,
  ) {}

  find(start: number, delimiterLength: number): number {
    const { value, repairEnding } = this;

    if (delimiterLength === 1) {
      const cached = this.inlineResults[start];

      if (cached !== undefined) {
        return cached;
      }
    }

    let closeIndex = -1;

    for (let index = start; index < value.length; index += 1) {
      if (value[index] !== '$' || isEscaped(value, index)) {
        continue;
      }

      const runLength = countDollarRun(value, index);

      if (delimiterLength === 1 && runLength === 1) {
        if (value[index - 1] !== '$') {
          closeIndex = index;
          break;
        }
      }

      if (delimiterLength === 1 && runLength === 2) {
        let adjacentValid = this.adjacentValidity[index];

        if (adjacentValid === undefined) {
          const adjacentValueStart = index + 2;
          const adjacentClose = this.find(adjacentValueStart, 1);

          if (adjacentClose === -1) {
            adjacentValid =
              repairEnding &&
              normalizeRepairedDollarValue(value.slice(adjacentValueStart), 1) !== undefined;
          } else {
            const adjacentValue = normalizeClosedDollarValue(
              value.slice(adjacentValueStart, adjacentClose),
            );
            const adjacentNext = adjacentClose + 1;

            adjacentValid = adjacentValue !== undefined && !/\d/.test(value[adjacentNext] ?? '');
          }

          this.adjacentValidity[index] = adjacentValid;
        }

        if (adjacentValid) {
          closeIndex = index;
          break;
        }
      }

      if (delimiterLength === 2 && runLength === 2) {
        closeIndex = index;
        break;
      }

      index += runLength - 1;
    }

    if (delimiterLength === 1) {
      this.inlineResults[start] = closeIndex;
    }

    return closeIndex;
  }
}

const normalizeContainerSource = (source: string, quoteDepth: number): string => {
  if (quoteDepth === 0) {
    return source;
  }

  return source.replace(/(\r\n|\r|\n)([^\r\n]*)/g, (_match, endline: string, line: string) => {
    let content = line;

    for (let depth = 0; depth < quoteDepth; depth += 1) {
      content = content.replace(/^[ \t]*>[ \t]?/, '');
    }

    return endline + content;
  });
};

const sourceForLiterals = (
  nodes: MathLiteral[],
  quoteDepth: number,
): SourcedLiteral[] | undefined => {
  if (nodes.some((node) => typeof node.data?.source !== 'string')) {
    return undefined;
  }

  return nodes.map((node) => ({
    node,
    source: normalizeContainerSource(node.data?.source ?? '', quoteDepth),
    quoteDepth,
  }));
};

const isMathLiteral = (node: RootContent): node is MathLiteral => {
  if (node.type === 'strong' || node.type === 'emphasis' || node.type === 'delete') {
    return node.children.every(isMathLiteral);
  }

  return node.type === 'text' || node.type === 'inlineMath' || node.type === 'break';
};

const hasMathSyntaxCandidate = (value: string): boolean => {
  return (
    value.includes('$') || value.includes(PANDOC_INLINE_OPEN) || value.includes(PANDOC_DISPLAY_OPEN)
  );
};

const hasChangedText = (nodes: RootContent[], quoteDepth: number): boolean => {
  return nodes.some((node) => {
    if (typeof node.data?.source !== 'string') {
      return true;
    }

    if (node.type === 'text') {
      return (
        node.value !== decodeMarkdownText(normalizeContainerSource(node.data.source, quoteDepth))
      );
    }

    return 'children' in node && hasChangedText(node.children, quoteDepth);
  });
};

const bridgeInlineMath = (math: InlineMath): InlineMath => {
  const mode = math.data?.pandocMath?.mode;

  return {
    ...math,
    data: createPlaceholderData(
      math.value,
      mode === 'display' ? BLOCK_MATH_PLACEHOLDER : INLINE_MATH_PLACEHOLDER,
      math.data,
      math.data?.repairEnding,
    ),
  };
};

const hasRepeatedPandocOpen = (value: string, open: string): boolean => {
  for (let index = 0; index < value.length - 1; index += 1) {
    if (value.startsWith(open, index) && !isEscaped(value, index)) {
      return true;
    }
  }

  return false;
};

const parseLiteral = (
  raw: string,
  repairEnding: boolean,
  literals: SourcedLiteral[],
  trailingWhitespace: string,
): ParsedLiteral => {
  const dollarCloseFinder = new DollarCloseFinder(raw, repairEnding);
  const content: ParsedContent = [];
  let textStart = 0;
  let index = 0;
  let adjacentOpenIndex = -1;

  const flushText = (end: number): void => {
    content.push(...sliceLiteralContent(literals, textStart, end));
  };

  while (index < raw.length) {
    if ((raw[index] !== '$' && raw[index] !== '\\') || !canOpenMathAt(literals, index)) {
      index += 1;

      continue;
    }

    const pandocMode: PandocMode | undefined = raw.startsWith(PANDOC_INLINE_OPEN, index)
      ? 'inline'
      : raw.startsWith(PANDOC_DISPLAY_OPEN, index)
        ? 'display'
        : undefined;

    if (pandocMode && !isEscaped(raw, index)) {
      const open = pandocMode === 'inline' ? PANDOC_INLINE_OPEN : PANDOC_DISPLAY_OPEN;
      const close = pandocMode === 'inline' ? PANDOC_INLINE_CLOSE : PANDOC_DISPLAY_CLOSE;
      const valueStart = index + open.length;
      const closeIndex = findPandocClose(raw, valueStart, close);

      if (closeIndex !== -1) {
        flushText(index);
        content.push(
          createInlineMath(
            raw.slice(valueStart, closeIndex),
            pandocMode,
            false,
            sourceForRange(literals, index, closeIndex + close.length),
          ),
        );
        index = closeIndex + close.length;
        textStart = index;
        continue;
      }

      if (repairEnding) {
        const candidate = raw.slice(valueStart);

        if (hasRepeatedPandocOpen(candidate, open)) {
          return {
            content: [],
            preserveFallback: true,
          };
        }

        flushText(index);

        const value = candidate.trimStart();

        content.push(createInlineMath(value ? value + trailingWhitespace : '', pandocMode, true));

        index = raw.length;
        textStart = index;
        continue;
      }
    }

    if (
      raw[index] === '$' &&
      !isEscaped(raw, index) &&
      (raw[index - 1] !== '$' || isEscaped(raw, index - 1) || index === adjacentOpenIndex)
    ) {
      const delimiterLength = countDollarRun(raw, index);

      if (delimiterLength === 1 || delimiterLength === 2) {
        const valueStart = index + delimiterLength;
        const closeIndex = dollarCloseFinder.find(valueStart, delimiterLength);

        if (closeIndex !== -1) {
          const value = raw.slice(valueStart, closeIndex);

          const normalized = normalizeClosedDollarValue(value);
          const next = closeIndex + delimiterLength;
          const followedByDigit = delimiterLength === 1 && /\d/.test(raw[next] ?? '');

          if (normalized !== undefined && !followedByDigit) {
            flushText(index);
            content.push(
              createInlineMath(
                normalized,
                undefined,
                false,
                sourceForRange(literals, index, closeIndex + delimiterLength),
              ),
            );
            adjacentOpenIndex =
              delimiterLength === 1 && raw[closeIndex + 1] === '$' ? closeIndex + 1 : -1;
            index = next;
            textStart = index;
            continue;
          }

          if (
            repairEnding &&
            (normalized !== undefined ||
              MATH_OPERATOR_PATTERN.test(value) ||
              hasTexControlWord(value))
          ) {
            index = next;

            continue;
          }
        } else if (repairEnding) {
          const normalized = normalizeRepairedDollarValue(
            raw.slice(valueStart),
            delimiterLength,
            trailingWhitespace,
          );

          if (normalized !== undefined) {
            flushText(index);

            content.push(
              createInlineMath(normalized ? normalized + trailingWhitespace : '', undefined, true),
            );

            index = raw.length;
            textStart = index;
            continue;
          }
        }
      }
    }

    index += 1;
  }

  flushText(raw.length);

  return { content, preserveFallback: false };
};

const findFinalRepairLeaf = (node: Parent | RootContent): RootContent | undefined => {
  if ('children' in node) {
    let index = node.children.length - 1;

    while (index >= 0 && node.children[index]?.type === 'parserPatch') {
      index -= 1;
    }

    const child = node.children[index];

    return child ? findFinalRepairLeaf(child) : undefined;
  }

  return node;
};

/** Markdown excludes final whitespace from text spans; recover only verified ancestor suffixes. */
const getRepairTrailingWhitespace = (root: Parent): string => {
  const parents: Parent[] = [];

  let node: Parent | RootContent = root;

  while ('children' in node) {
    const child: RootContent | undefined = findLast(
      node.children,
      (item) => item.type !== 'parserPatch',
    );

    if (!child) {
      return '';
    }

    parents.push(node);

    node = child;
  }

  let source = node.data?.source;

  let whitespace = '';

  for (let index = parents.length - 1; index >= 0; index -= 1) {
    const raw = parents[index]?.data?.source;

    if (source === undefined || raw === undefined) {
      return '';
    }

    const start = raw.lastIndexOf(source);

    const suffix = raw.slice(start + source.length);

    if (start < 0 || !/^[ \t\r\n]*$/.test(suffix)) {
      return '';
    }

    whitespace += suffix;

    source = raw;
  }

  return whitespace;
};

const isUnclosedBlockMath = (source: string | undefined): boolean => {
  if (source === undefined) {
    return false;
  }

  const lines = source.split(/\r?\n/);

  const opening = /^ {0,3}(\${2,})/.exec(lines[0] ?? '');

  if (!opening?.[1]) {
    return false;
  }

  const closing = /^[ \t]*(?:>[ \t]*)*(\${2,})[ \t]*$/.exec(lines.at(-1) ?? '');

  return lines.length === 1 || (closing?.[1]?.length ?? 0) < opening[1].length;
};

const getRepairedBlockMathValue = (
  value: string,
  source: string,
  trailingWhitespace: string,
): string => {
  const whitespace = /[ \t\r\n]*$/.exec(source)?.[0] ?? '';

  const normalized = value.trimEnd() + whitespace + trailingWhitespace;

  const partialCloser =
    trailingWhitespace.length === 0 &&
    /^ {0,3}\$\$(?!\$)/.test(source) &&
    /\r?\n[ \t]{0,3}\$$/.test(source);

  return partialCloser ? normalized.replace(/(^|\r?\n)[ \t]{0,3}\$$/, '$1') : normalized;
};

const processParent = (
  parent: Parent,
  repairTarget: RootContent | undefined,
  quoteDepth = 0,
  repairOnly = false,
  trailingWhitespace = '',
): boolean => {
  const depth = quoteDepth + (parent.type === 'blockquote' ? 1 : 0);

  let changed = false;

  let consumed = false;

  const nextChildren: RootContent[] = [];

  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];

    if (!child) {
      continue;
    }

    if (repairOnly && child.type === 'inlineMath') {
      nextChildren.push(child);

      continue;
    }

    if (isMathLiteral(child)) {
      const literals = [child];

      const includesPendingOpener = repairOnly && hasMathSyntaxCandidate(child.data?.source ?? '');

      while (index + 1 < parent.children.length) {
        const next = parent.children[index + 1];

        if (
          !next ||
          !isMathLiteral(next) ||
          (repairOnly && next.type === 'inlineMath' && !includesPendingOpener)
        ) {
          break;
        }

        literals.push(next);
        index += 1;
      }

      const sources = sourceForLiterals(literals, depth);

      const literalSource = sources?.map(({ source }) => source).join('');

      if (
        sources === undefined ||
        literalSource === undefined ||
        !hasMathSyntaxCandidate(literalSource) ||
        hasChangedText(literals, depth)
      ) {
        nextChildren.push(
          ...literals.map((literal) =>
            literal.type === 'inlineMath' ? bridgeInlineMath(literal) : literal,
          ),
        );

        changed ||= literals.some((literal) => literal.type === 'inlineMath');

        continue;
      }

      const parsed = parseLiteral(
        literalSource,
        literals.some((literal) => findFinalRepairLeaf(literal) === repairTarget),
        sources,
        trailingWhitespace,
      );

      const repaired = parsed.content.some((node) => node.data?.repairEnding === true);

      if (parsed.preserveFallback || (repairOnly && !repaired)) {
        nextChildren.push(...literals);
      } else {
        nextChildren.push(...parsed.content);

        changed ||=
          parsed.content.length !== literals.length ||
          parsed.content.some((node, offset) => node !== literals[offset]);

        consumed ||= repaired;
      }

      continue;
    }

    if (child.type === 'math') {
      const incomplete = child === repairTarget && isUnclosedBlockMath(child.data?.source);

      if (repairOnly && !incomplete) {
        nextChildren.push(child);

        continue;
      }

      const source = normalizeContainerSource(child.data?.source ?? '', depth);

      const value = incomplete
        ? getRepairedBlockMathValue(child.value, source, trailingWhitespace)
        : child.value;

      nextChildren.push({
        ...child,
        value,
        data: createPlaceholderData(value, BLOCK_MATH_PLACEHOLDER, child.data, incomplete),
      });

      changed = true;

      consumed ||= incomplete;
    } else {
      nextChildren.push(child);
    }
  }

  for (const child of nextChildren) {
    if (
      'children' in child &&
      processParent(child, repairTarget, depth, repairOnly, trailingWhitespace)
    ) {
      consumed = true;
    }
  }

  if (changed) {
    parent.children = nextChildren;
  }

  if (consumed && parent.data) {
    delete parent.data.source;
  }

  return consumed;
};

export const transformMath = (tree: Root, repairEnding: boolean): void => {
  processParent(
    tree,
    repairEnding ? findFinalRepairLeaf(tree) : undefined,
    0,
    false,
    repairEnding ? getRepairTrailingWhitespace(tree) : '',
  );
};

export const repairMath = (tree: Parent): void => {
  processParent(tree, findFinalRepairLeaf(tree), 0, true, getRepairTrailingWhitespace(tree));
};
