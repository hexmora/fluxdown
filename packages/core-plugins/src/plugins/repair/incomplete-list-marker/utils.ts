import type { Paragraph, Parent, RootContent, Text } from 'mdast';

import {
  getRepairInlineSource,
  getRepairSourceOffset,
  isRepairMarker,
  isRepairSourceTail,
  withoutRepairSource,
} from '../../../utils';

export const getListMarkerCutoff = (node: Text, first: boolean): number | undefined => {
  const source = node.data?.source;

  const match = /(?:^|(?:\r\n|\r|\n))[ \t]*(?:-{1,2}|[+*]|\d{1,9}[.)]?)[ \t]*$/.exec(node.value);

  if (source === undefined || !match) {
    return undefined;
  }

  const marker = match[0].trim();

  const offset = match.index + match[0].search(/[-+*\d]/);

  if (!isRepairMarker(node, offset, marker.length)) {
    return undefined;
  }

  // Inline siblings can split a single prose line into several text nodes.
  if (match.index === 0 && !first && !/^[\r\n]/.test(match[0])) {
    return undefined;
  }

  const sourceOffset = getRepairSourceOffset(node, offset, marker.length);

  if (sourceOffset === undefined) {
    return undefined;
  }

  const lineStart =
    Math.max(
      source.lastIndexOf('\n', sourceOffset - 1),
      source.lastIndexOf('\r', sourceOffset - 1),
    ) + 1;

  const prefix = source.slice(lineStart, sourceOffset).replace(/^(?: {0,3}>[ \t]?)+/, '');

  return /^ {0,3}$/.test(prefix) ? match.index : undefined;
};

/** A trailing Setext underline inside a list can still become a nested list marker. */
export const getIncompleteListParagraph = (
  node: RootContent,
  parents: Parent[],
): Paragraph | undefined => {
  if (
    node.type !== 'heading' ||
    node.depth !== 2 ||
    parents[0]?.type !== 'listItem' ||
    !isRepairSourceTail(node, parents)
  ) {
    return;
  }

  const source = node.data?.source ?? '';

  const ending = /(?:\r\n|\r|\n)([^\r\n]*)$/.exec(source);

  if (!ending) {
    return;
  }

  let marker = ending[1] ?? '';

  for (const parent of parents) {
    if (parent.type !== 'blockquote') {
      continue;
    }

    const quote = /^[ \t]*>[ \t]?/.exec(marker);

    if (!quote) {
      return;
    }

    marker = marker.slice(quote[0].length);
  }

  if (!/^[ \t]*-+[ \t]*$/.test(marker)) {
    return;
  }

  const raw = getRepairInlineSource(node);

  if (!raw || raw.source !== source.slice(0, ending.index).trimEnd()) {
    return;
  }

  const { depth: _depth, ...heading } = node;

  return withoutRepairSource({ ...heading, type: 'paragraph' });
};
