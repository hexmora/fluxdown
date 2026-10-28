import type { ThemeTokens } from '../../typings/theme';

export const getBlockSpacing = (tagName: string, tokens: ThemeTokens, nested = false) => {
  if (tagName in tokens.heading) {
    const heading = tokens.heading[tagName as keyof ThemeTokens['heading']];

    return { marginTop: heading.marginTop, marginBottom: heading.marginBottom };
  }

  if (tagName === 'p') {
    return tokens.paragraph;
  }

  if (tagName === 'ul' || tagName === 'ol') {
    const spacing = nested ? tokens.spacing.xs : tokens.spacing.md;

    return { marginTop: spacing, marginBottom: spacing };
  }

  if (['blockquote', 'pre', 'table'].includes(tagName)) {
    return { marginTop: tokens.spacing.lg, marginBottom: tokens.spacing.lg };
  }

  return null;
};

export const getBlockStyle = (tagName: string, tokens: ThemeTokens, nested = false) => {
  const spacing = getBlockSpacing(tagName, tokens, nested);

  return spacing
    ? { marginTop: `${spacing.marginTop}px`, marginBottom: `${spacing.marginBottom}px` }
    : {};
};
