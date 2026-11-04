import type { CodeHighlighterProps } from '../../../../../base';

import { AnimatedText, useTextStyle, useTheme } from '../../../../../base';
import { CodeHighlighterRenderer } from '../../../../code';
import { useHighlighted } from './hooks';
import { tokenStyle } from './utils';

export const CodePrismRenderer = ({
  code,
  language = 'plaintext',
  ...props
}: CodeHighlighterProps) => {
  const { tokens } = useTheme();

  const lines = useHighlighted(code, language);

  const textStyle = useTextStyle({
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.code.fontSize,
    lineHeight: tokens.code.lineHeight,
  });

  return (
    <CodeHighlighterRenderer {...props} code={code} language={language}>
      {lines?.map((line, lineIndex) => (
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
      ))}
    </CodeHighlighterRenderer>
  );
};
