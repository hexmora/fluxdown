import type { ReactStyle } from 'react-native-code-highlighter';

import type { ThemeTokens } from '../../../../../../../typings';

export const createHighlightStyle = ({ colors, syntax }: ThemeTokens): ReactStyle => ({
  hljs: { color: colors.fg },
  'hljs-comment': { color: syntax.comment },
  'hljs-quote': { color: syntax.comment },
  'hljs-keyword': { color: syntax.keyword },
  'hljs-selector-tag': { color: syntax.keyword },
  'hljs-literal': { color: syntax.keyword },
  'hljs-string': { color: syntax.string },
  'hljs-regexp': { color: syntax.string },
  'hljs-number': { color: syntax.number },
  'hljs-attr': { color: syntax.variable },
  'hljs-variable': { color: syntax.variable },
  'hljs-title': { color: syntax.function },
  'hljs-built_in': { color: syntax.function },
  'hljs-symbol': { color: syntax.punctuation },
  'hljs-addition': { color: syntax.inserted },
  'hljs-deletion': { color: syntax.deleted },
  'hljs-emphasis': { fontStyle: 'italic' },
  'hljs-strong': { fontWeight: 'bold' },
});
