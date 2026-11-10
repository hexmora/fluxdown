import type {
  Delete,
  Emphasis,
  Heading,
  Link,
  LinkReference,
  Literal,
  Paragraph,
  Parent,
  PhrasingContent,
  RootContent,
  Strong,
  Text,
} from 'mdast';

import { decodeString } from 'micromark-util-decode-string';

/** A structural tail can already be closed by whitespace, a newline, or a delimiter. */
export const isRepairSourceTail = (node: Parent | RootContent, parents: Parent[]): boolean => {
  const source = node.data?.source;

  return (
    typeof source === 'string' &&
    source.length > 0 &&
    parents.every((parent) => parent.data?.source?.endsWith(source))
  );
};

export const getRepairSourceOffset = (
  node: Literal,
  offset: number,
  length = 1,
): number | undefined => {
  const raw = node.data?.source;

  if (typeof raw !== 'string') {
    return;
  }

  const suffix = node.value.slice(offset);

  if (raw.endsWith(suffix)) {
    return raw.length - suffix.length;
  }

  // An unchanged prefix locates a marker even when its content contains entities.
  if (raw.startsWith(node.value.slice(0, offset + length))) {
    return offset;
  }

  if (decodeString(raw) === node.value) {
    const start = getRawTextOffset(raw, offset);

    const end = getRawTextOffset(raw, offset + length);

    if (
      start !== undefined &&
      end !== undefined &&
      raw.slice(start, end) === node.value.slice(offset, offset + length)
    ) {
      return start;
    }
  }

  return undefined;
};

export const isRepairMarker = (node: Literal, offset: number, length = 1): boolean => {
  const sourceOffset = getRepairSourceOffset(node, offset, length);

  if (sourceOffset === undefined) {
    return false;
  }

  const value = node.data?.source;

  if (typeof value !== 'string') {
    return false;
  }

  let escapes = 0;

  for (let index = sourceOffset - 1; index >= 0 && value.charAt(index) === '\\'; index -= 1) {
    escapes += 1;
  }

  return escapes % 2 === 0;
};

type PhrasingParent = Paragraph | Heading | Emphasis | Strong | Delete | Link | LinkReference;

export const isRepairPhrasingParent = (node: Parent | RootContent): node is PhrasingParent => {
  return ['paragraph', 'heading', 'emphasis', 'strong', 'delete', 'link', 'linkReference'].includes(
    node.type,
  );
};

export const isCompleteRepairPhrasingParent = (node: Parent | RootContent): boolean => {
  return (
    isRepairPhrasingParent(node) &&
    node.type !== 'paragraph' &&
    node.type !== 'heading' &&
    typeof node.data?.source === 'string'
  );
};

export interface InlineRange {
  node: PhrasingContent;
  start: number;
  end: number;
  opaque?: boolean;
}
export const getRawTextOffset = (source: string, valueOffset: number): number | undefined => {
  if (!/[\\&]/.test(source)) {
    return valueOffset >= 0 && valueOffset <= source.length ? valueOffset : undefined;
  }

  let decoded = 0;

  for (let offset = 0; offset < source.length; ) {
    if (decoded === valueOffset) {
      return offset;
    }

    const character = source[offset] ?? '';

    const token =
      character === '\\' || character === '&'
        ? (/^(?:\\[!-/:-@[-`{-~]|&(?:#[xX][\da-fA-F]+|#\d+|[A-Za-z][A-Za-z\d]*);)/.exec(
            source.slice(offset),
          )?.[0] ?? character)
        : character;

    const value = decodeString(token);

    if (decoded + value.length > valueOffset) {
      return value === token ? offset + valueOffset - decoded : undefined;
    }

    decoded += value.length;

    offset += token.length;
  }

  return decoded === valueOffset ? source.length : undefined;
};

/** Preserve text while retaining provenance only for an exact, verified source slice. */
export const sliceRepairText = (
  node: Text,
  start: number,
  end = node.value.length,
): Text | undefined => {
  const source = node.data?.source;

  if (source === undefined) {
    return;
  }

  const exact = decodeString(source) === node.value;

  const rawOffset = (offset: number): number | undefined => {
    if (source === node.value) {
      return offset;
    }

    if (exact) {
      return getRawTextOffset(source, offset);
    }

    if (offset === 0) {
      return 0;
    }

    const suffix = node.value.slice(offset);

    if (source.endsWith(suffix)) {
      return source.length - suffix.length;
    }

    return source.startsWith(node.value.slice(0, offset)) ? offset : undefined;
  };

  const rawStart = rawOffset(start);

  const rawEnd = rawOffset(end);

  const value = node.value.slice(start, end);

  const raw =
    rawStart === undefined || rawEnd === undefined ? undefined : source.slice(rawStart, rawEnd);

  return raw !== undefined && decodeString(raw) === value
    ? { type: 'text', value, data: { ...node.data, source: raw } }
    : { type: 'text', value };
};

const getValueOffset = (node: Text, offset: number): number | undefined => {
  const source = node.data?.source;

  if (source === undefined) {
    return;
  }

  if (source === node.value) {
    return offset;
  }

  const prefix = decodeString(source.slice(0, offset));

  if (node.value.startsWith(prefix)) {
    return prefix.length;
  }

  const suffix = decodeString(source.slice(offset));

  return node.value.endsWith(suffix) ? node.value.length - suffix.length : undefined;
};

const sliceSourceText = (node: Text, start: number, end: number): Text | undefined => {
  const valueStart = getValueOffset(node, start);

  const valueEnd = getValueOffset(node, end);

  const source = node.data?.source?.slice(start, end);

  if (valueStart === undefined || valueEnd === undefined || source === undefined) {
    return;
  }

  const value = node.value.slice(valueStart, valueEnd);

  return decodeString(source) === value
    ? { type: 'text', value, data: { ...node.data, source } }
    : { type: 'text', value };
};

export const sliceRanges = (
  ranges: InlineRange[],
  start: number,
  end: number,
): PhrasingContent[] | undefined => {
  const children: PhrasingContent[] = [];

  for (const range of ranges) {
    if (range.end <= start || range.start >= end) {
      continue;
    }

    if (range.start >= start && range.end <= end) {
      children.push(range.node);

      continue;
    }

    if (range.node.type !== 'text') {
      return;
    }

    const sliced = sliceSourceText(
      range.node,
      Math.max(start - range.start, 0),
      Math.min(end, range.end) - range.start,
    );

    if (!sliced) {
      return;
    }

    if (sliced.value) {
      children.push(sliced);
    }
  }

  return children;
};

export const isEscaped = (source: string, index: number): boolean => {
  let slashes = 0;

  for (let offset = index - 1; offset >= 0 && source[offset] === '\\'; offset -= 1) {
    slashes += 1;
  }

  return slashes % 2 === 1;
};

/** Build raw spans only when each phrasing child retains verifiable source. */
export interface RepairInlineSource {
  source: string;
  ranges: InlineRange[];
}

export const getRepairInlineSource = (
  node: Parent,
  allowOpaque = false,
): RepairInlineSource | undefined => {
  const ranges: InlineRange[] = [];

  let source = '';

  for (const child of node.children) {
    const raw = child.data?.source;

    if (raw === undefined && (!allowOpaque || child.type === 'text')) {
      return;
    }

    if (child.type === 'text' && raw !== undefined && decodeString(raw) !== child.value) {
      return;
    }

    const token = raw ?? '\0';

    ranges.push({
      node: child as PhrasingContent,
      start: source.length,
      end: source.length + token.length,
      opaque: raw === undefined,
    });

    source += token;
  }

  return { source, ranges };
};

export const withoutRepairSource = <T extends Parent | RootContent>(node: T): T => {
  const result = { ...node, data: { ...node.data } };

  delete result.data.source;

  if (Object.keys(result.data).length === 0) {
    delete (result as Parent | RootContent).data;
  }

  return result;
};
