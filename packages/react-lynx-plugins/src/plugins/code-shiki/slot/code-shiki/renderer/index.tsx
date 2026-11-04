import type { CSSProperties } from '@lynx-js/types';

import { useMemo } from '@lynx-js/react';

import type { CodeHighlighterProps } from '../../../../../base';

import { AnimatedText, useTextStyle, useTheme } from '../../../../../base';
import { CodeHighlighterRenderer } from '../../../../code/slot/code-highlighter/renderer';
import { useHighlighter } from './hooks';
import { createCodeTheme } from './utils';

export const CodeShikiRenderer = ({
  code,
  language = 'plaintext',
  ...props
}: CodeHighlighterProps) => {
  const { tokens } = useTheme();

  const highlighter = useHighlighter();

  const textStyle = useTextStyle({
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.code.fontSize,
    lineHeight: tokens.code.lineHeight,
  });

  const lines = useMemo(() => {
    if (!highlighter) return;

    try {
      const lang = highlighter.getLoadedLanguages().includes(language) ? language : 'text';

      return highlighter.codeToTokens(code.replace(/\t/g, '  '), {
        lang,
        theme: createCodeTheme(tokens),
      }).tokens;
    } catch (error) {
      console.error(error);
    }
  }, [code, highlighter, language, tokens]);

  return (
    <CodeHighlighterRenderer {...props} code={code} language={language}>
      {lines?.map((line, lineIndex) => (
        <AnimatedText key={lineIndex} style={textStyle}>
          {line.length === 0
            ? '\u200b'
            : line.map((token, tokenIndex) => (
                <AnimatedText
                  key={tokenIndex}
                  style={
                    {
                      ...textStyle,
                      color: token.color,
                      fontStyle: token.fontStyle && token.fontStyle & 1 ? 'italic' : 'normal',
                      fontWeight:
                        token.fontStyle && token.fontStyle & 2 ? '700' : textStyle.fontWeight,
                      textDecoration:
                        token.fontStyle && token.fontStyle & 4 ? 'underline' : undefined,
                    } satisfies CSSProperties
                  }
                >
                  {token.content}
                </AnimatedText>
              ))}
        </AnimatedText>
      ))}
    </CodeHighlighterRenderer>
  );
};
