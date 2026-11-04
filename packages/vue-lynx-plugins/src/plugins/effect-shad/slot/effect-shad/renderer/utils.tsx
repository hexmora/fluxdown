import type { VNodeChild } from 'vue';

import { getTextUnits, getTextWords } from '@fluxdown/hast';
import { cloneVNode, isVNode } from 'vue';

const mapText = (
  children: VNodeChild,
  map: (text: string) => VNodeChild,
  opaque: (node: VNodeChild) => VNodeChild = (node) => node,
): VNodeChild => {
  if (Array.isArray(children)) {
    return children.map((child) => mapText(child, map, opaque));
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return map(String(children));
  }

  if (isVNode(children)) {
    const content = children.props?.children ?? children.children;

    if (typeof content === 'string' || Array.isArray(content)) {
      const mapped = mapText(content, map, opaque);

      const node = cloneVNode(children, { children: mapped });

      node.children = typeof mapped === 'string' || Array.isArray(mapped) ? mapped : null;

      return node;
    }

    if (
      content &&
      typeof content === 'object' &&
      'default' in content &&
      typeof content.default === 'function'
    ) {
      const mapped = mapText(content.default(), map, opaque);

      const node = cloneVNode(children, { children: mapped });

      node.children = { default: () => mapped };

      return node;
    }
  }

  return opaque(children);
};

export const getText = (children: VNodeChild) => {
  let value = '';

  mapText(children, (text) => {
    value += text;

    return text;
  });

  return value;
};

export const sliceText = (
  children: VNodeChild,
  start: number,
  end: number,
  keepOpaque = false,
): VNodeChild => {
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
  children: VNodeChild;
  prefix: VNodeChild;
  prefixText: string;
};

export const getShadTokens = (leading: VNodeChild, active: VNodeChild, position = 0) => {
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
