import type { Parent } from 'mdast';

import { last } from 'lodash-es';

import { getRepairSourceOffset } from '../../../utils';

export const getInlineCodeValue = (
  node: Parent,
  index: number,
  offset: number,
  length: number,
): string | undefined => {
  const child = node.children[index];

  if (child?.type !== 'text' || child.data?.source === undefined) {
    return undefined;
  }

  const sourceOffset = getRepairSourceOffset(child, offset, length);

  if (sourceOffset === undefined) {
    return undefined;
  }

  let value = child.data.source.slice(sourceOffset + length);

  let decoded = child.value.slice(offset + length);

  for (const following of node.children.slice(index + 1)) {
    if (following.data?.source === undefined) {
      return undefined;
    }

    value += following.data.source;

    decoded += 'value' in following ? following.value : '';
  }

  // Multiline containers include source prefixes absent from their literal values.
  if (/[\r\n]/.test(value) && value !== decoded) {
    return undefined;
  }

  const source = node.data?.source;

  const tailSource = last(node.children)?.data?.source;

  const padding = source?.match(/[ \t]+$/)?.[0];

  if (
    source !== undefined &&
    tailSource !== undefined &&
    padding &&
    source.endsWith(tailSource + padding)
  ) {
    value += padding;
  }

  const closing = value.match(/`+$/)?.[0];

  if (closing && closing.length < length) {
    value = value.slice(0, -closing.length);
  }

  value = value.replace(/\r\n?|\n/g, ' ');

  if (value.startsWith(' ') && value.endsWith(' ') && /[^ ]/.test(value)) {
    value = value.slice(1, -1);
  }

  // GFM tables unescape pipes in code, while preserving escaped backslashes.
  return node.type === 'tableCell'
    ? value.replace(/\\([\\|])/g, (match, character: string) =>
        character === '|' ? character : match,
      )
    : value;
};
