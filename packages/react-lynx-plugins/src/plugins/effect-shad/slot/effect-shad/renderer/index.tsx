import type { CSSProperties } from '@lynx-js/types';

import { useMemo, useState } from '@lynx-js/react';
import { pick } from 'lodash-es';

import type { ShadProps } from '../../../../../base';
import type { TokenMeasurement } from './utils';

import {
  AnimatedText,
  joinClassNames,
  useLatestFn,
  useTextLayoutWidth,
  useTextStyle,
  useTheme,
} from '../../../../../base';
import { getGradient, getShadTokens, splitShadToken } from './utils';
import './style.scss';

export type ShadRendererProps = Omit<ShadProps, 'Raw'> & { Raw?: ShadProps['Raw'] };

export const ShadRenderer = ({
  Raw: _Raw,
  active,
  isActive,
  leading,
  maskWidth,
  className,
  style,
  ...elementProps
}: ShadRendererProps) => {
  const textStyle = useTextStyle(style);

  const layoutWidth = useTextLayoutWidth();

  const { tokens } = useTheme();

  const source = useMemo(
    () => (isActive ? getShadTokens(leading, active) : { leading: [leading, active], tokens: [] }),
    [leading, active, isActive],
  );

  const font = `${textStyle.fontSize}:${textStyle.fontFamily}:${textStyle.fontWeight}:${textStyle.fontStyle}:${textStyle.letterSpacing}:${textStyle.lineHeight}:${layoutWidth}`;

  const [wrapped, setWrapped] = useState<
    Record<string, { text: string; font: string; ends: number[] }>
  >({});

  const content = useMemo(
    () => ({
      leading: source.leading,
      tokens: source.tokens.flatMap((token) => {
        const previous = wrapped[token.key];

        return previous?.font === font && token.text === previous.text
          ? splitShadToken(token, previous.ends)
          : [token];
      }),
    }),
    [source, wrapped, font],
  );

  const [widths, setWidths] = useState<
    Record<string, TokenMeasurement & { text: string; prefixText: string; font: string }>
  >({});

  const estimates = useMemo(
    () =>
      Object.fromEntries(
        content.tokens.map((token) => {
          const info = { fontSize: String(textStyle.fontSize), fontFamily: textStyle.fontFamily };

          return [
            token.key,
            {
              width: lynx.getTextInfo(token.text, info).width,
              prefix: token.prefixText ? lynx.getTextInfo(token.prefixText, info).width : 0,
            },
          ];
        }),
      ),
    [content.tokens, textStyle.fontSize, textStyle.fontFamily],
  );

  const measurements = Object.fromEntries(
    content.tokens.map((token) => {
      const { width, prefix } = estimates[token.key]!;

      const current = widths[token.key];

      const matches = current?.text === token.text && current.font === font;

      const measured = matches ? (current.width ?? width) : width;

      const measuredPrefix =
        matches && current.prefixText === token.prefixText ? current.prefix : undefined;

      return [
        token.key,
        {
          width: measured,
          prefix: measuredPrefix ?? (width > 0 ? (prefix * measured) / width : 0),
        },
      ];
    }),
  );

  const onMeasure = useLatestFn(
    (
      key: string,
      text: string,
      prefixText: string,
      measuredFont: string,
      value: TokenMeasurement,
    ) => {
      if (
        Object.values(value).some((width) => !Number.isFinite(width) || width < 0) ||
        measuredFont !== font ||
        !content.tokens.some(
          (token) => token.key === key && token.text === text && token.prefixText === prefixText,
        )
      )
        return;

      setWidths((previous) => {
        const next = pick(
          previous,
          content.tokens.map((token) => token.key),
        );

        const current = next[key];

        const measurement = {
          ...(current?.text === text && current.font === font ? current : {}),
          ...(current?.prefixText === prefixText ? {} : { prefix: undefined }),
          ...value,
          text,
          prefixText,
          font,
        };

        if (
          current?.width === measurement.width &&
          current?.prefix === measurement.prefix &&
          current.text === text &&
          current.prefixText === prefixText &&
          current.font === font &&
          Object.keys(next).length === Object.keys(previous).length
        )
          return previous;

        return { ...next, [key]: measurement };
      });
    },
  );

  const onWrap = useLatestFn((key: string, text: string, measuredFont: string, ends: number[]) => {
    if (
      ends.length <= 1 ||
      measuredFont !== font ||
      !source.tokens.some((token) => token.key === key && token.text === text)
    )
      return;

    // Preserve normal word boundaries. Only split words that the host has
    // already wrapped, at the host's actual line boundaries. This preserves
    // shaping within each line while preventing the mask from restarting.
    setWrapped((previous) => ({
      ...pick(
        previous,
        source.tokens.map((token) => token.key),
      ),
      [key]: { text, font, ends },
    }));
  });

  return (
    <AnimatedText
      {...elementProps}
      className={joinClassNames('fluxdown-shad', className)}
      style={textStyle}
    >
      <AnimatedText style={textStyle}>{content.leading}</AnimatedText>
      {content.tokens.map((token) => {
        if (/^\s+$/.test(token.text))
          return (
            <AnimatedText key={token.key} style={textStyle}>
              {token.children}
            </AnimatedText>
          );

        const gradient = getGradient(content.tokens, measurements, token.key);

        const width = measurements[token.key]?.width ?? 0;

        // A native text gradient restarts at each wrapped line. Mask individual
        // words against the same unwrapped range, preserving their text colors.
        // Lynx gradient stops support percentages, not CSS pixel lengths.
        return (
          <view
            key={token.key}
            className="fluxdown-shad-active"
            style={
              {
                ...textStyle,
                maskImage:
                  gradient && width > 0
                    ? `linear-gradient(to right, #000 ${(gradient.start / width) * 100}%, transparent ${((gradient.start + gradient.width) / width) * 100}%)`
                    : undefined,
              } as CSSProperties
            }
            bindlayoutchange={({ detail }) =>
              onMeasure(token.key, token.text, token.prefixText, font, { width: detail.width })
            }
          >
            <AnimatedText
              style={textStyle}
              bindlayout={({ detail }) =>
                onWrap(
                  token.key,
                  token.text,
                  font,
                  detail.lines.map((line) => line.end),
                )
              }
            >
              {token.children}
            </AnimatedText>
            {token.prefixText.length > 0 && (
              <view
                accessibility-elements-hidden={true}
                className="fluxdown-shad-prefix"
                bindlayoutchange={({ detail }) =>
                  onMeasure(token.key, token.text, token.prefixText, font, { prefix: detail.width })
                }
              >
                <AnimatedText style={textStyle}>{token.prefix}</AnimatedText>
              </view>
            )}
          </view>
        );
      })}
      <view
        accessibility-elements-hidden={true}
        className="fluxdown-shad-mask"
        style={{
          width: `${maskWidth}px`,
          marginLeft: `${-maskWidth}px`,
          opacity: isActive ? 1 : 0,
          backgroundImage: `linear-gradient(to right, transparent, ${tokens.colors.bg})`,
        }}
      />
    </AnimatedText>
  );
};
