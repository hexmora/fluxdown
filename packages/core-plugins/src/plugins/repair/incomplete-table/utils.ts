import type { Data, Paragraph, Parent, PhrasingContent, RootContent } from 'mdast';
import type { Node } from 'unist';

import { decodeString } from 'micromark-util-decode-string';

import { getRepairInlineSource, isRepairSourceTail } from '../../../utils';

interface SourceLine {
  value: string;
  offset: number;
  ended: boolean;
}

interface ChildRange {
  child: PhrasingContent;
  start: number;
  end: number;
}

const withoutSource = <T extends PhrasingContent | Paragraph>(node: T): T => {
  const data: Data = { ...node.data };

  delete data.source;

  const result: T = { ...node, data };

  if (Object.keys(data).length === 0) {
    delete (result as Node).data;
  }

  return result;
};

const normalizeSource = (source: string, quoteDepth: number): string => {
  const parts = source.split(/(\r\n|\r|\n)/);

  return parts
    .map((part, index) => {
      if (index % 2 === 1) {
        return part;
      }

      let value = part;

      if (index > 0) {
        for (let depth = 0; depth < quoteDepth; depth += 1) {
          value = value.replace(/^[ \t]*>[ \t]?/, '');
        }

        value = value.trimStart();
      }

      return index < parts.length - 1 ? value.trimEnd() : value;
    })
    .join('');
};

const hasCurrentSource = (node: PhrasingContent, quoteDepth: number): boolean => {
  const source = node.data?.source;

  if (typeof source !== 'string') {
    return false;
  }

  if (node.type === 'text') {
    return decodeString(normalizeSource(source, quoteDepth)) === node.value;
  }

  return (
    !('children' in node) || node.children.every((child) => hasCurrentSource(child, quoteDepth))
  );
};

const getChildRanges = (paragraph: Paragraph, quoteDepth: number): ChildRange[] | undefined => {
  const source = paragraph.data?.source;

  if (typeof source !== 'string') {
    return;
  }

  const ranges: ChildRange[] = [];

  let offset = 0;

  for (const child of paragraph.children) {
    const raw = child.data?.source;

    if (typeof raw !== 'string') {
      return;
    }

    const start = source.indexOf(raw, offset);

    if (start < 0 || normalizeSource(source.slice(offset, start), quoteDepth).trim() !== '') {
      return;
    }

    // A preceding transformer may have changed a text node without removing its provenance.
    if (!hasCurrentSource(child, quoteDepth)) {
      return;
    }

    offset = start + raw.length;

    ranges.push({ child, start, end: offset });
  }

  return normalizeSource(source.slice(offset), quoteDepth).trim() === '' ? ranges : undefined;
};

const getLines = (source: string, quoteDepth: number): SourceLine[] => {
  const lines: SourceLine[] = [];

  const pattern = /([^\r\n]*)(\r\n|\r|\n|$)/g;

  let offset = 0;

  for (const match of source.matchAll(pattern)) {
    let value = match[1] ?? '';

    let prefix = 0;

    if (lines.length > 0) {
      for (let depth = 0; depth < quoteDepth; depth += 1) {
        const marker = /^[ \t]*>[ \t]?/.exec(value);

        if (!marker) {
          if (value.trim() === '') {
            break;
          }

          return [];
        }

        prefix += marker[0].length;

        value = value.slice(marker[0].length);
      }
    }

    const indentation = /^[ \t]*/.exec(value)?.[0].length ?? 0;

    lines.push({
      value: value.slice(indentation),
      offset: offset + prefix + indentation,
      ended: Boolean(match[2]),
    });

    offset += match[0].length;

    if (!match[2]) {
      break;
    }
  }

  return lines;
};

const getColumnCount = (value: string): number => {
  let pipes = 0;

  let lastPipe = -1;

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '\\') {
      index += 1;
    } else if (value[index] === '|') {
      pipes += 1;

      lastPipe = index;
    }
  }

  if (pipes === 0) {
    return 0;
  }

  return (
    pipes + 1 - Number(value.startsWith('|')) - Number(lastPipe === value.trimEnd().length - 1)
  );
};

const isDelimiterPrefix = (value: string, columns: number): boolean => {
  if (/^-[ \t]+/.test(value)) {
    return false;
  }

  const cells = value.split('|');

  if (value.startsWith('|')) {
    cells.shift();
  }

  if (cells.length > columns + 1) {
    return false;
  }

  return (
    cells.every((cell, index) => {
      const content = cell.trim();

      return index === cells.length - 1 ? /^:?(?:-+:?)?$/.test(content) : /^:?-+:?$/.test(content);
    }) &&
    (cells.length <= columns || cells.at(-1)?.trim() === '')
  );
};

const hasHeaderPipe = (ranges: ChildRange[], line: SourceLine): boolean => {
  for (let index = 0; index < line.value.length; index += 1) {
    if (line.value[index] === '\\') {
      index += 1;
    } else if (line.value[index] === '|') {
      const offset = line.offset + index;

      const range = ranges.find((candidate) => candidate.start <= offset && candidate.end > offset);

      if (range?.child.type === 'text') {
        return true;
      }
    }
  }

  return false;
};

const getChildSourceOffset = (parent: Parent, child: Parent): number | undefined => {
  const source = parent.data?.source;

  if (typeof source !== 'string') {
    return;
  }

  let offset = 0;

  for (const sibling of parent.children) {
    const raw = sibling.data?.source;

    if (typeof raw !== 'string') {
      return;
    }

    const start = source.indexOf(raw, offset);

    if (start < 0) {
      return;
    }

    const gap = source.slice(offset, start);

    const allowed =
      parent.type === 'blockquote'
        ? /^[\s>]*$/.test(gap)
        : parent.type === 'listItem' && offset === 0
          ? /^[ \t]*(?:[-+*]|\d+[.)])[ \t]+$/.test(gap)
          : /^\s*$/.test(gap);

    if (!allowed) {
      return;
    }

    if (sibling === child) {
      return start;
    }

    offset = start + raw.length;
  }
};

const getSourceTail = (
  paragraph: Paragraph,
  container: Parent,
  parents: Parent[],
): string | undefined => {
  let source = paragraph.data?.source;

  let branch: Parent = paragraph;

  let offset = 0;

  if (typeof source !== 'string') {
    return;
  }

  for (const parent of [container, ...parents]) {
    const start = getChildSourceOffset(parent, branch);

    const raw = parent.data?.source;

    if (start === undefined || typeof raw !== 'string') {
      return;
    }

    offset += start;

    source = raw;

    branch = parent;
  }

  return source.slice(offset);
};

export const getIncompleteTableParagraph = (
  paragraph: Paragraph,
  container: Parent,
  parents: Parent[],
): Paragraph | undefined => {
  const source = getSourceTail(paragraph, container, parents);

  const quoteDepth = [container, ...parents].filter((node) => node.type === 'blockquote').length;

  const ranges = getChildRanges(paragraph, quoteDepth);

  if (source === undefined || !ranges) {
    return;
  }

  const lines = getLines(source, quoteDepth);

  let last = lines.at(-1);

  if (last?.value.trim() === '') {
    lines.pop();

    last = lines.at(-1);
  }

  if (!last || last.value.trim() === '') {
    return;
  }

  const previous = lines.at(-2);

  const columns = previous ? getColumnCount(previous.value) : 0;

  let start: number;

  if (
    previous &&
    columns > 0 &&
    hasHeaderPipe(ranges, previous) &&
    isDelimiterPrefix(last.value, columns)
  ) {
    if (last.ended) {
      return;
    }

    start = previous.offset;
  } else if (last.value.startsWith('|') && (!previous || getColumnCount(previous.value) === 0)) {
    start = last.offset;
  } else {
    return;
  }

  const raw = paragraph.data?.source;

  if (typeof raw !== 'string' || start >= raw.length) {
    return;
  }

  const lineEnd = Math.max(raw.lastIndexOf('\n', start - 1), raw.lastIndexOf('\r', start - 1));

  const cutoff =
    lineEnd < 0 ? 0 : raw[lineEnd] === '\n' && raw[lineEnd - 1] === '\r' ? lineEnd - 1 : lineEnd;

  const children: PhrasingContent[] = [];

  for (const { child, start: childStart, end } of ranges) {
    if (childStart >= cutoff) {
      break;
    }

    if (end <= cutoff) {
      children.push(child);

      continue;
    }

    if (child.type === 'break') {
      continue;
    }

    if (child.type !== 'text' || typeof child.data?.source !== 'string') {
      return;
    }

    const suffix = decodeString(
      normalizeSource(child.data.source.slice(cutoff - childStart), quoteDepth),
    );

    if (!child.value.endsWith(suffix)) {
      return;
    }

    const value = child.value.slice(0, child.value.length - suffix.length);

    if (value) {
      children.push({ ...withoutSource(child), value });
    }
  }

  return { ...withoutSource(paragraph), children };
};

/** A dash-only delimiter prefix can temporarily turn an unpiped table header into Setext. */
export const isIncompleteTableSetext = (
  node: RootContent | undefined,
  parents: Parent[],
): boolean => {
  if (node?.type !== 'heading' || node.depth !== 2 || !isRepairSourceTail(node, parents)) {
    return false;
  }

  const lines = node.data?.source?.split(/\r\n|\r|\n/);

  if (lines?.length !== 2 || !/^(?:[ \t]*>)*[ \t]*-+[ \t]*$/.test(lines[1] ?? '')) {
    return false;
  }

  const raw = getRepairInlineSource(node);

  if (!raw || raw.source !== lines[0]?.trimEnd()) {
    return false;
  }

  return raw.ranges.some(
    (range) =>
      range.node.type === 'text' && /(^|[^\\])(?:\\\\)*\|/.test(range.node.data?.source ?? ''),
  );
};
