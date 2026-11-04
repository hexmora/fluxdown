import type { CSSProperties } from '@lynx-js/types';
import type { ThemedToken } from 'shiki/core';

import { defineComponent } from 'vue';

import type { CodeHighlighterProps } from '../../../../../base';

import { AnimatedText, useTextStyle, useTheme } from '../../../../../base';
import { CodeHighlighterRenderer } from '../../../../code/slot/code-highlighter/renderer';
import { useHighlighter } from './hooks';
import { createCodeTheme } from './utils';

export const CodeShikiRenderer = /*#__PURE__*/ defineComponent(
  (input: CodeHighlighterProps, { attrs }) => {
    const highlighter = useHighlighter();

    return () => {
      const { code, language = 'plaintext', ...props } = input;

      const { tokens } = useTheme();

      const textStyle = useTextStyle({
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.code.fontSize,
        lineHeight: tokens.code.lineHeight,
      });

      const lang = highlighter.value?.getLoadedLanguages().includes(language) ? language : 'text';

      let lines: ThemedToken[][] | undefined;

      try {
        lines = highlighter.value?.codeToTokens(code.replace(/\t/g, '  '), {
          lang,
          theme: createCodeTheme(tokens),
        }).tokens;
      } catch (error) {
        console.error(error);
      }

      const children = lines?.map((line, lineIndex) => (
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
      ));

      return (
        <CodeHighlighterRenderer
          {...attrs}
          {...props}
          class={props.class}
          style={props.style}
          code={code}
          language={language}
          children={children}
        />
      );
    };
  },
  {
    name: 'FluxdownCodeShikiRenderer',
    props: ['Raw', 'code', 'language', 'meta', 'suffix', 'class', 'style'],
    inheritAttrs: false,
  },
);
