import type { PhrasingContent, Text } from 'mdast';

import { isRepairMarker, sliceRepairText } from '../../../utils';

/** CommonMark left-flanking rules, including the stricter intraword underscore rule. */
const canOpenRepairDelimiter = (value: string, offset: number, length: number): boolean => {
  const prefix = value.slice(0, offset);

  const suffix = value.slice(offset + length);

  const precedingBoundary = prefix.length === 0 || /[\s\p{P}\p{S}]$/u.test(prefix);

  if (value.charAt(offset) === '_' && !precedingBoundary) {
    return false;
  }

  // A trailing marker can still become an opener when the next chunk arrives.
  if (suffix.length === 0) {
    return true;
  }

  return !/^\s/u.test(suffix) && (!/^[\p{P}\p{S}]/u.test(suffix) || precedingBoundary);
};

/** Locate an unchanged tail in the source, without treating decoded escapes as syntax. */
type DelimiterType = 'emphasis' | 'strong' | 'delete';
const getPartialDelimiterChildren = (
  children: PhrasingContent[],
  type: DelimiterType,
): PhrasingContent[] | undefined => {
  if (type === 'emphasis') {
    return undefined;
  }

  const tail = children.at(-1);

  const beforeTail = children.at(-2);

  if (beforeTail?.type !== 'text' || tail?.type !== (type === 'strong' ? 'emphasis' : 'delete')) {
    return undefined;
  }

  const marker = beforeTail.value.at(-1);

  const source = tail.data?.source;

  if (
    !marker ||
    !(type === 'strong' ? marker === '*' || marker === '_' : marker === '~') ||
    beforeTail.value.at(-2) === marker ||
    !source?.startsWith(marker) ||
    source.startsWith(marker.repeat(2)) ||
    !isRepairMarker(beforeTail, beforeTail.value.length - 1) ||
    !canOpenRepairDelimiter(beforeTail.value + source, beforeTail.value.length - 1, 2)
  ) {
    return undefined;
  }

  const prefix = sliceRepairText(beforeTail, 0, beforeTail.value.length - 1);

  if (!prefix) {
    return undefined;
  }

  return [
    ...children.slice(0, -2),
    ...(prefix.value ? [prefix] : []),
    { type, children: tail.children },
  ];
};

const getDelimiterRunLength = (node: Text, offset: number): number => {
  let length = 1;

  while (node.value.charAt(offset + length) === node.value.charAt(offset)) {
    length += 1;
  }

  return length;
};

const getDelimiterBoundary = (node: PhrasingContent | undefined, end: boolean): string => {
  if (!node) {
    return '';
  }

  const source = node.data?.source ?? (node.type === 'text' ? node.value : '!');

  return source.at(end ? -1 : 0) ?? '';
};

/** Complete only this plugin's delimiters, preserving other syntaxes for their own repairs. */
export const getIncompleteDelimiterChildren = (
  children: PhrasingContent[],
  type: DelimiterType,
  minimumLength = type === 'strong' ? 2 : 1,
): PhrasingContent[] | undefined => {
  const partial =
    type !== 'delete' || minimumLength === 1
      ? getPartialDelimiterChildren(children, type)
      : undefined;

  if (partial) {
    return partial;
  }

  for (const [index, child] of children.entries()) {
    if (child.type !== 'text') {
      continue;
    }

    if (!(type === 'delete' ? child.value.includes('~') : /[*_]/.test(child.value))) {
      continue;
    }

    for (let offset = 0; offset < child.value.length; offset += 1) {
      const marker = child.value.charAt(offset);

      if (!(type === 'delete' ? marker === '~' : marker === '*' || marker === '_')) {
        continue;
      }

      const runLength = getDelimiterRunLength(child, offset);

      const length = type === 'strong' ? 2 : type === 'delete' ? runLength : 1;

      const before = getDelimiterBoundary(children[index - 1], true);

      const after = getDelimiterBoundary(children[index + 1], false);

      if (
        runLength < minimumLength ||
        (type === 'emphasis' && runLength !== 1) ||
        (type === 'delete' && runLength > 2) ||
        !isRepairMarker(child, offset, runLength) ||
        !canOpenRepairDelimiter(before + child.value + after, before.length + offset, runLength)
      ) {
        offset += runLength - 1;

        continue;
      }

      const prefix = sliceRepairText(child, 0, offset);

      const suffix = sliceRepairText(child, offset + length);

      if (!prefix || !suffix) {
        continue;
      }

      let following = [...(suffix.value ? [suffix] : []), ...children.slice(index + 1)];

      const tail = following.at(-1);

      if (length === 2 && tail?.type === 'text') {
        const closingOffset = tail.value.length - 1;

        if (
          tail.value.endsWith(marker) &&
          closingOffset > 0 &&
          tail.value.charAt(closingOffset - 1) !== marker &&
          !/\s/u.test(tail.value.charAt(closingOffset - 1)) &&
          isRepairMarker(tail, closingOffset)
        ) {
          const content = sliceRepairText(tail, 0, closingOffset);

          if (content) {
            following = [...following.slice(0, -1), content];
          }
        }
      }

      const content = getIncompleteDelimiterChildren(following, type, minimumLength) ?? following;

      const replacement: PhrasingContent[] = children.slice(0, index);

      if (prefix.value) {
        replacement.push(prefix);
      }

      if (content.length > 0) {
        replacement.push({ type, children: content });
      }

      return replacement;
    }
  }

  return undefined;
};
