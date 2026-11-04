import type { SetupContext, VNodeChild } from 'vue';

import type { CodeHighlighterProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextStyleProvider,
  useTextStyle,
  useTheme,
} from '../../../../../base';
import './style.scss';

export const CodeHighlighterRenderer = (
  {
    Raw: _Raw,
    children,
    class: className,
    code,
    language: _language,
    meta: _meta,
    style,
    suffix,
    ...elementProps
  }: CodeHighlighterProps & { children?: VNodeChild[] },
  { slots }: Pick<SetupContext, 'slots'>,
) => {
  const { tokens } = useTheme();

  const textStyle = useTextStyle({
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.code.fontSize,
    lineHeight: tokens.code.lineHeight,
  });

  const isWeb = typeof SystemInfo !== 'undefined' && String(SystemInfo.platform) === 'web';

  const lines = children ?? slots.default?.() ?? code.replace(/\t/g, '  ').split('\n');

  return (
    <TextStyleProvider value={textStyle}>
      <scroll-view
        {...elementProps}
        scroll-x
        class={joinClassNames(
          'fluxdown-code-highlighter',
          isWeb && 'fluxdown-code-highlighter-web',
          className,
        )}
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

CodeHighlighterRenderer.inheritAttrs = false;
