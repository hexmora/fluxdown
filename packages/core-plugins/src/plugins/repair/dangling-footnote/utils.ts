import type { Parent } from 'mdast';

import { last } from 'lodash-es';

import { COMPLETE_FOOTNOTE_REFERENCE, INCOMPLETE_FOOTNOTE_REFERENCE } from './consts';

export const removeCompleteReferences = (
  value: string,
  isMarker: (offset: number, length: number) => boolean,
): string => {
  return value.replace(COMPLETE_FOOTNOTE_REFERENCE, (match, offset: number) => {
    return isMarker(offset, match.length) ? '' : match;
  });
};

export const removeIncompleteReference = (
  value: string,
  isMarker: (offset: number, length: number) => boolean,
): string => {
  const match = INCOMPLETE_FOOTNOTE_REFERENCE.exec(value);

  if (!match || match.index === undefined || !isMarker(match.index, match[0].length)) {
    return value;
  }

  return value.slice(0, match.index);
};

export const isStructuralTail = (node: unknown, parents: Parent[]): boolean => {
  let child = node;

  for (const parent of parents) {
    if (last(parent.children) !== child) {
      return false;
    }

    child = parent;
  }

  return true;
};
