import type { Parent, PhrasingContent } from 'mdast';

import { type InlineRange, isEscaped, sliceRanges } from '../../../utils';

export interface IncompleteResource {
  prefix: PhrasingContent[];
  label: PhrasingContent[];
}

const isResourceEscape = (source: string, offset: number): boolean => {
  return source[offset] === '\\' && /[!-/:-@[-`{-~]/.test(source[offset + 1] ?? '');
};

/** Whether appending characters can still finish this inline destination and title. */
export const isResourcePrefix = (source: string): boolean => {
  if (source === '') {
    return true;
  }

  if (source[0] === '[') {
    return (
      /^\[(?:\\.|[^[\]\\\r\n]){0,999}\]?$/.test(source) &&
      !(source.endsWith(']') && source !== '[]' && !/[^\t\n\r ]/.test(source.slice(1, -1)))
    );
  }

  if (source[0] !== '(') {
    return false;
  }

  let offset = 1;

  while (/\s/.test(source[offset] ?? '') && offset < source.length) {
    offset += 1;
  }

  if (source[offset] === '<') {
    offset += 1;

    for (; offset < source.length; offset += 1) {
      if (isResourceEscape(source, offset)) {
        offset += 1;
      } else if (source[offset] === '>') {
        offset += 1;

        break;
      } else if (source[offset] === '<' || /[\r\n]/.test(source[offset] ?? '')) {
        return false;
      }
    }
  } else {
    let depth = 0;

    for (; offset < source.length; offset += 1) {
      const character = source[offset];

      if (isResourceEscape(source, offset)) {
        offset += 1;
      } else if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        if (depth === 0) {
          return false;
        }

        depth -= 1;
      } else if (/\s/.test(character ?? '')) {
        if (depth > 0) {
          return false;
        }

        break;
      } else if (character === '<') {
        return false;
      }
    }
  }

  if (offset >= source.length) {
    return true;
  }

  const whitespace = offset;

  while (/\s/.test(source[offset] ?? '') && offset < source.length) {
    offset += 1;
  }

  if (offset >= source.length) {
    return true;
  }

  if (offset === whitespace) {
    return false;
  }

  const opener = source[offset];

  if (opener !== '"' && opener !== "'" && opener !== '(') {
    return false;
  }

  const closer = opener === '(' ? ')' : opener;

  for (offset += 1; offset < source.length; offset += 1) {
    if (isResourceEscape(source, offset)) {
      offset += 1;
    } else if (source[offset] === closer) {
      return /^\s*$/.test(source.slice(offset + 1));
    } else if (opener === '(' && source[offset] === '(') {
      return false;
    }
  }

  return true;
};

/** Mask parsed literal spans without changing any raw source offsets. */
export const getResourceScanSource = (node: PhrasingContent): string | undefined => {
  const source = node.data?.source;

  if (source === undefined) {
    return;
  }

  if (
    [
      'inlineCode',
      'inlineMath',
      'image',
      'imageReference',
      'link',
      'linkReference',
      'html',
    ].includes(node.type)
  ) {
    return '\0'.repeat(source.length);
  }

  if (!('children' in node)) {
    return source;
  }

  const length =
    node.type === 'strong'
      ? 2
      : node.type === 'emphasis'
        ? 1
        : node.type === 'delete'
          ? source.startsWith('~~')
            ? 2
            : 1
          : 0;

  if (length === 0) {
    return;
  }

  const delimiter = source.slice(0, length);

  let scanned = delimiter;

  let offset = length;

  for (const child of node.children) {
    const raw = child.data?.source;

    if (raw === undefined || !source.startsWith(raw, offset)) {
      return;
    }

    const childSource = getResourceScanSource(child);

    if (childSource === undefined) {
      return;
    }

    scanned += childSource;

    offset += raw.length;
  }

  return source.slice(offset) === delimiter ? scanned + delimiter : undefined;
};

interface ResourceBracket {
  opener: number;
  close: number;
  image: boolean;
  insideImage: boolean;
  range: InlineRange;
}

export const getResourceBrackets = (source: string, ranges: InlineRange[]): ResourceBracket[] => {
  const brackets: ResourceBracket[] = [];

  const stack: ResourceBracket[] = [];

  let rangeIndex = 0;

  let imageDepth = 0;

  for (let offset = 0; offset < source.length; offset += 1) {
    while (ranges[rangeIndex] && ranges[rangeIndex]!.end <= offset) {
      rangeIndex += 1;
    }

    const range = ranges[rangeIndex];

    if (!range) {
      break;
    }

    if (
      range.opaque ||
      [
        'inlineCode',
        'inlineMath',
        'image',
        'imageReference',
        'link',
        'linkReference',
        'html',
      ].includes(range.node.type)
    ) {
      offset = range.end - 1;

      continue;
    }

    if (source[offset] === '\\') {
      offset += 1;

      continue;
    }

    if (source[offset] === ']') {
      const bracket = stack.pop();

      if (bracket) {
        bracket.close = offset;

        imageDepth -= Number(bracket.image);
      }

      continue;
    }

    if (source[offset] !== '[') {
      continue;
    }

    const image = source[offset - 1] === '!' && !isEscaped(source, offset - 1);

    const bracket = {
      opener: offset,
      close: source.length,
      image,
      insideImage: imageDepth > 0,
      range,
    };

    brackets.push(bracket);

    stack.push(bracket);

    imageDepth += Number(image);
  }

  return brackets;
};

export const hasLinkDescendant = (children: PhrasingContent[]): boolean => {
  return children.some(
    (child) =>
      child.type === 'link' ||
      child.type === 'linkReference' ||
      ('children' in child && hasLinkDescendant(child.children)),
  );
};

export const getIncompleteResource = (
  node: Parent,
  image: boolean,
): IncompleteResource | undefined => {
  if (!node.children.some((child) => child.data?.source?.includes(image ? '![' : '['))) {
    return;
  }

  const ranges: InlineRange[] = [];

  let source = '';

  let scanned = '';

  for (const child of node.children) {
    const raw = child.data?.source;

    if (raw === undefined && child.type === 'text') {
      return;
    }

    const token = raw ?? '\0';

    const masked = raw === undefined ? '\0' : getResourceScanSource(child as PhrasingContent);

    if (masked === undefined) {
      return;
    }

    scanned += masked;

    ranges.push({
      node: child as PhrasingContent,
      start: source.length,
      end: source.length + token.length,
      opaque: raw === undefined,
    });

    source += token;
  }

  for (const bracket of getResourceBrackets(scanned, ranges)) {
    const { opener, close, range } = bracket;

    if (
      bracket.image !== image ||
      (!image && bracket.insideImage) ||
      (!image &&
        (source[opener + 1] === '^' ||
          source[opener - 1] === '[' ||
          source[opener - 1] === ']' ||
          source[opener - 1] === '!'))
    ) {
      continue;
    }

    const start = image ? opener - 1 : opener;

    if (range.node.type !== 'text' || range.start > start) {
      continue;
    }

    if (close < source.length && !isResourcePrefix(source.slice(close + 1))) {
      continue;
    }

    const prefix = sliceRanges(ranges, 0, start);

    const label = sliceRanges(ranges, opener + 1, close);

    if (prefix && label && (image || !hasLinkDescendant(label))) {
      return { prefix, label };
    }
  }
};
