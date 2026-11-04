import type { ReactNode } from '@lynx-js/react';

import { getTextUnits, getTextWords } from '@fluxdown/hast';
import { Children, cloneElement, isValidElement } from '@lynx-js/react';

const mapText = (
  children: ReactNode,
  map: (text: string) => ReactNode,
  opaque: (node: ReactNode) => ReactNode = (node) => node,
): ReactNode =>
  Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return map(String(child));
    }

    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      Children.toArray(child.props.children).length > 0
    ) {
      const mapped = mapText(child.props.children, map, opaque);

      return Children.count(mapped) > 0 ? cloneElement(child, undefined, mapped) : null;
    }

    return opaque(child);
  });

export const getText = (children: ReactNode) => {
  let value = '';

  mapText(children, (text) => {
    value += text;

    return text;
  });

  return value;
};

export const sliceText = (
  children: ReactNode,
  start: number,
  end: number,
  keepOpaque = false,
): ReactNode => {
  let offset = 0;

  return mapText(
    children,
    (text) => {
      const from = Math.max(0, start - offset);

      const to = Math.min(text.length, end - offset);

      offset += text.length;

      return from < to ? text.slice(from, to) : null;
    },
    (node) => (keepOpaque ? node : null),
  );
};

export type ShadToken = {
  key: string;
  text: string;
  children: ReactNode;
  prefix: ReactNode;
  prefixText: string;
};

export const getShadTokens = (leading: ReactNode, active: ReactNode, position = 0) => {
  const children = [leading, active];

  const prefix = getText(leading).length;

  const text = getText(children);

  let offset = 0;

  let settled = prefix;

  const tokens: ShadToken[] = [];

  for (const word of getTextWords(text)) {
    const start = offset;

    const key = /^\s+$/.test(word) ? `space-${position}` : `word-${position}`;

    offset += word.length;

    position += [...getTextUnits(word)].length;

    if (offset <= prefix) {
      continue;
    }

    if (tokens.length === 0) {
      settled = start;
    }

    const prefixEnd = Math.max(start, Math.min(prefix, offset));

    tokens.push({
      key,
      text: word,
      children: sliceText(children, start, offset),
      prefix: sliceText(children, start, prefixEnd),
      prefixText: text.slice(start, prefixEnd),
    });
  }

  // The base mapper keeps opaque nodes outside the active range. Preserve
  // them once in the leading content instead of copying them into every token.
  return { leading: sliceText(children, 0, settled, true), tokens };
};

export type TokenMeasurement = { prefix?: number; width?: number };

export const splitShadToken = (token: ShadToken, ends: number[]): ShadToken[] => {
  let offset = 0;

  return [...ends.filter((end) => end > 0 && end < token.text.length), token.text.length].map(
    (end) => {
      const start = offset;

      offset = end;

      return {
        key: `${token.key}-${start}`,
        text: token.text.slice(start, offset),
        children: sliceText(token.children, start, offset),
        prefix: sliceText(token.prefix, start, offset),
        prefixText: token.prefixText.slice(start, offset),
      };
    },
  );
};

export const getGradient = (
  tokens: ShadToken[],
  measurements: Record<string, TokenMeasurement>,
  key: string,
) => {
  let width = 0;

  let offset = 0;

  let current: { prefix: number; width: number } | undefined;

  for (const token of tokens) {
    const measured = measurements[token.key];

    const prefix = token.prefixText.length > 0 ? measured?.prefix : 0;

    if (measured?.width === undefined || prefix === undefined) {
      continue;
    }

    const measurement = { width: measured.width, prefix };

    if (token.key === key) {
      current = measurement;
    } else if (!current) {
      offset += measurement.width - measurement.prefix;
    }

    width += measurement.width - measurement.prefix;
  }

  return current ? { start: current.prefix - offset, width } : null;
};
