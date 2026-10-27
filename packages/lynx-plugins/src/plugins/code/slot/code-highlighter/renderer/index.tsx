import type { ReactNode } from '@lynx-js/react';

import type { CodeHighlighterProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextStyleProvider,
  useTextStyle,
  useTheme,
} from '../../../../../base';

export const CodeHighlighterRenderer = ({
  Raw: _Raw,
  children,
  className,
  code,
  language: _language,
  meta: _meta,
  style,
  suffix,
  ...elementProps
}: CodeHighlighterProps & { children?: ReactNode[] }) => {
  const { tokens } = useTheme();

  const textStyle = useTextStyle({
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.code.fontSize,
    lineHeight: tokens.code.lineHeight,
  });

  const lines = children ?? code.replace(/\t/g, '  ').split('\n');

  return (
    <TextStyleProvider value={textStyle}>
      <scroll-view
        {...elementProps}
        scroll-x
        className={joinClassNames('fluxdown-code-highlighter', className)}
        style={{ width: '100%', ...style }}
      >
        <view
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: tokens.spacing.lg,
            minWidth: '100%',
          }}
        >
          {lines.map((line, index) => (
            <AnimatedText key={index} style={{ ...textStyle, whiteSpace: 'nowrap' }}>
              {line || '\u200b'}
              {index === lines.length - 1 ? suffix : null}
            </AnimatedText>
          ))}
        </view>
      </scroll-view>
    </TextStyleProvider>
  );
};
