import type { CSSProperties } from '@lynx-js/types';
import type { ElementContent, Parent, Root } from 'hast';

import { createContext, useContext } from '@lynx-js/react';
import { findLast } from 'lodash-es';

import type { ThemeTokens } from '../theme/type';

import { useTheme } from '../theme';
import { isElementWithTag, isHastElement } from './utils';

export interface BlockLayout {
  first: boolean;

  last: boolean;

  previous?: Root | null;
}

const BlockLayoutContext = /*#__PURE__*/ createContext<BlockLayout>({ first: true, last: true });

export const BlockLayoutProvider = BlockLayoutContext.Provider;

export const isBlockElement = (node: ElementContent): boolean =>
  isElementWithTag(
    node,
    'p',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'table',
    'hr',
    'div',
    'section',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ) ||
  (node.type === 'element' && node.properties.dataType === 'block-math');

const toPixels = (value: string, tokens: ThemeTokens): number => {
  const spacing = /^var\(--fluxdown-spacing-(xs|sm|md|lg|xl)\)$/.exec(value)?.[1];

  const resolved = spacing ? tokens.spacing[spacing as keyof ThemeTokens['spacing']] : value;

  const number = parseFloat(resolved);

  return resolved.endsWith('rem') ? number * 16 : number;
};

export const getBlockSpacing = (
  node: ElementContent,
  tokens: ThemeTokens,
  parent?: Parent,
): [string, string] => {
  if (node.type !== 'element') {
    return ['0', '0'];
  }

  if (node.tagName in tokens.heading) {
    const heading = tokens.heading[node.tagName as keyof ThemeTokens['heading']];

    return [heading.marginTop, heading.marginBottom];
  }

  if (node.tagName === 'p') {
    if (parent && isHastElement(parent) && parent.tagName === 'li') {
      return [tokens.spacing.sm, tokens.spacing.sm];
    }

    return [tokens.paragraph.marginTop, tokens.paragraph.marginBottom];
  }

  if (node.tagName === 'ul' || node.tagName === 'ol') {
    if (parent && isHastElement(parent) && parent.tagName === 'li') {
      return [tokens.spacing.xs, tokens.spacing.xs];
    }

    return [tokens.spacing.md, tokens.spacing.md];
  }

  if (node.tagName === 'li') {
    return [tokens.spacing.xs, tokens.spacing.xs];
  }

  if (node.tagName === 'hr') {
    return [tokens.divider.marginBlock, tokens.divider.marginBlock];
  }

  if (node.properties.dataFootnotes) {
    return [tokens.footnotes.marginTop, '0'];
  }

  return [tokens.spacing.lg, tokens.spacing.lg];
};

/** Flex/linear layouts do not collapse block margins, so account for the preceding block. */
export const getBlockStyle = (
  current: ElementContent,
  parents: Parent[],
  tokens: ThemeTokens,

  layout?: BlockLayout,
): CSSProperties => {
  const parent = parents.at(-1);

  const siblings = parent?.children.filter(
    (child): child is ElementContent =>
      child.type === 'element' || (child.type === 'text' && Boolean(child.value.trim())),
  ) ?? [current];

  const index = siblings.indexOf(current);

  const [top, bottom] = getBlockSpacing(current, tokens, parent);

  const previousRoot = parent?.type === 'root' && index === 0 ? layout?.previous : undefined;

  const previous =
    siblings[index - 1] ??
    findLast(previousRoot?.children, (child): child is ElementContent => child.type === 'element');

  const previousBottom =
    previous && isBlockElement(previous) ? getBlockSpacing(previous, tokens, parent)[1] : '0';

  if (isElementWithTag(current, 'li')) {
    return {
      marginTop: index <= 0 ? '0px' : top,
    };
  }

  if (parent?.type === 'root') {
    return {
      marginTop:
        index === 0 && layout?.first
          ? '0px'
          : previous
            ? `${Math.max(0, toPixels(top, tokens) - toPixels(previousBottom, tokens))}px`
            : top,
      marginBottom: index === siblings.length - 1 && layout?.last ? '0px' : bottom,
    };
  }

  return {
    marginTop:
      index <= 0
        ? '0px'
        : `${Math.max(0, toPixels(top, tokens) - toPixels(previousBottom, tokens))}px`,
    // A list's last item margin cannot collapse through the quote's padding.
    marginBottom:
      index === siblings.length - 1
        ? parent &&
          isHastElement(parent) &&
          parent.tagName === 'blockquote' &&
          isElementWithTag(current, 'ul', 'ol')
          ? tokens.spacing.xs
          : '0px'
        : bottom,
  };
};

export const useBlockStyle = (current: ElementContent, parents: Parent[]): CSSProperties => {
  const layout = useContext(BlockLayoutContext);

  const { tokens } = useTheme();

  return getBlockStyle(current, parents, tokens, layout);
};
