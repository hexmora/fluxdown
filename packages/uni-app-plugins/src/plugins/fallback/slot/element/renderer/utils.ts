import type { CSSProperties } from 'vue';

import type { ThemeTokens } from '../../../../../typings/theme';

export const getInlineCodeStyle = (tokens: ThemeTokens): CSSProperties => {
  const fontSize = tokens.code.fontSize;

  const paddingBlock = fontSize * 0.15;

  const inset = paddingBlock + 1;

  return {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    maxWidth: '100%',
    padding: `${paddingBlock}px ${fontSize * 0.35}px`,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens.colors.border,
    borderRadius: `${tokens.radius.sm}px`,
    backgroundColor: tokens.colors.surfaceMuted,
    // Inline decoration paints outside its line box without increasing the line height.
    marginTop: `${-inset}px`,
    marginBottom: `${-inset}px`,
  };
};

export const getInlineCodeTextStyle = (
  tokens: ThemeTokens,
  parent: CSSProperties,
): CSSProperties => {
  const fontSize = tokens.code.fontSize;

  const parentSize = parseFloat(String(parent.fontSize ?? tokens.typography.fontSize.md));

  const parentLineHeight = parseFloat(
    String(parent.lineHeight ?? parentSize * tokens.typography.lineHeight.md),
  );

  return {
    fontFamily: tokens.typography.fontMono,
    fontSize: `${fontSize}px`,
    lineHeight: `${(parentLineHeight / parentSize) * fontSize}px`,
  };
};
