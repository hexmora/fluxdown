import type { Parent, PhrasingContent } from 'mdast';

import { nth } from 'lodash-es';

import { getRepairInlineSource, isEscaped, sliceRanges } from '../../../utils';

const isAsciiLetter = (value: string | undefined): boolean => {
  return value !== undefined && ((value >= 'a' && value <= 'z') || (value >= 'A' && value <= 'Z'));
};

const isAsciiDigit = (value: string | undefined): boolean => {
  return value !== undefined && value >= '0' && value <= '9';
};

const isTagNameCharacter = (value: string | undefined): boolean => {
  return isAsciiLetter(value) || isAsciiDigit(value) || value === '-' || value === ':';
};

const isPotentialTag = (value: string): boolean => {
  if (value === '<') {
    return true;
  }

  let index = 1;

  if (nth(value, index) === '/') {
    index += 1;

    if (index === value.length) {
      return true;
    }
  }

  if (!isAsciiLetter(nth(value, index))) {
    return false;
  }

  index += 1;

  while (isTagNameCharacter(nth(value, index))) {
    index += 1;
  }

  if (index === value.length) {
    return true;
  }

  const delimiter = nth(value, index);

  return delimiter === '/' || delimiter === '>' || /\s/.test(delimiter ?? '');
};

const getHtmlClosingBracket = (value: string): number => {
  let quote: '"' | "'" | undefined;

  for (let index = 1; index < value.length; index += 1) {
    const character = nth(value, index);

    if (quote) {
      if (character === quote) {
        quote = undefined;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;

      continue;
    }

    if (character === '>') {
      return index;
    }
  }

  return -1;
};

export const getIncompleteTagStart = (value: string): number | undefined => {
  let start = value.indexOf('<');

  while (start !== -1) {
    const suffix = value.slice(start);

    if (!isEscaped(value, start) && isPotentialTag(suffix)) {
      const closing = getHtmlClosingBracket(suffix);

      if (closing === -1) {
        if (!/^<https?:\/\//i.test(suffix)) {
          return start;
        }
      } else {
        start += closing;
      }
    }

    start = value.indexOf('<', start + 1);
  }
};
export const getIncompleteHtmlChildren = (node: Parent): PhrasingContent[] | undefined => {
  if (!['paragraph', 'heading', 'tableCell'].includes(node.type)) {
    return;
  }

  const raw = getRepairInlineSource(node, true);

  if (!raw) {
    return;
  }

  const { source, ranges } = raw;

  const start = getIncompleteTagStart(source);

  if (start === undefined) {
    return;
  }

  const range = ranges.find((item) => item.start <= start && item.end > start);

  if (range?.node.type !== 'text') {
    return;
  }

  return sliceRanges(ranges, 0, start);
};
