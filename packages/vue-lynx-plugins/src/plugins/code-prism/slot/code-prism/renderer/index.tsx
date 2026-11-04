import { defineComponent } from 'vue';

import type { CodeHighlighterProps } from '../../../../../base';

import { AnimatedText, useTextStyle, useTheme } from '../../../../../base';
import { CodeHighlighterRenderer } from '../../../../code';
import { useHighlighted } from './hooks';
import { tokenStyle } from './utils';

export const CodePrismRenderer = /*#__PURE__*/ defineComponent(
  (props: CodeHighlighterProps, { attrs }) => {
    const lines = useHighlighted(() => props);

    return () => {
      const { tokens } = useTheme();

      const textStyle = useTextStyle({
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.code.fontSize,
        lineHeight: tokens.code.lineHeight,
      });

      const children = lines.value?.map((line, lineIndex) => (
        <AnimatedText key={lineIndex} style={textStyle}>
          {line.length === 0
            ? '\u200b'
            : line.map((token, tokenIndex) => (
                <AnimatedText
                  key={tokenIndex}
                  style={{ ...textStyle, ...tokenStyle(token.types, tokens) }}
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
          children={children}
        />
      );
    };
  },
  {
    name: 'FluxdownCodePrismRenderer',
    props: ['Raw', 'code', 'language', 'meta', 'suffix', 'class', 'style'],
    inheritAttrs: false,
  },
);
