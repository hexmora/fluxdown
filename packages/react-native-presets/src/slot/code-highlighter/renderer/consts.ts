import type { HighlightTheme } from '@fluxdown/react-base-presets/base';

import type { NativeTheme } from '../../../base';

export const createHighlightTheme = (
  colors: NativeTheme['colors'],
  syntax: NativeTheme['syntax'],
): HighlightTheme => ({
  name: 'markdown-native',
  settings: [
    {
      settings: {
        foreground: colors.text,
        background: colors.codeBackground,
      },
    },
    { scope: 'comment', settings: { foreground: syntax.comment } },
    {
      scope: ['keyword', 'storage'],
      settings: { foreground: syntax.keyword },
    },
    {
      scope: ['string', 'entity.name.tag', 'markup.inline.raw'],
      settings: { foreground: syntax.string },
    },
    {
      scope: ['constant', 'support.constant'],
      settings: { foreground: syntax.number },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.type'],
      settings: { foreground: syntax.function },
    },
    {
      scope: ['variable', 'entity.other.attribute-name'],
      settings: { foreground: syntax.variable },
    },
    { scope: 'punctuation', settings: { foreground: syntax.punctuation } },
    { scope: 'markup.inserted', settings: { foreground: syntax.inserted } },
    { scope: 'markup.deleted', settings: { foreground: syntax.deleted } },
    { scope: 'markup.bold', settings: { fontStyle: 'bold' } },
    { scope: 'markup.italic', settings: { fontStyle: 'italic' } },
  ],
});
