import type { CSSProperties } from '@lynx-js/types';

import { pick } from 'lodash-es';
import { defineComponent, shallowRef } from 'vue';

import type { ShadProps } from '../../../../../base';
import type { TokenMeasurement } from './utils';

import {
  AnimatedText,
  joinClassNames,
  useTextLayoutWidth,
  useTextStyle,
  useTheme,
} from '../../../../../base';
import { getGradient, getShadTokens, splitShadToken } from './utils';
import './style.scss';

export type ShadRendererProps = Omit<ShadProps, 'Raw'> & { Raw?: ShadProps['Raw'] };

export const ShadRenderer = /*#__PURE__*/ defineComponent(
  (props: ShadRendererProps, { attrs }) => {
    const wrapped = shallowRef<Record<string, { text: string; font: string; ends: number[] }>>({});

    const widths = shallowRef<
      Record<string, TokenMeasurement & { text: string; prefixText: string; font: string }>
    >({});

    return () => {
      const {
        Raw: _Raw,
        active,
        isActive,
        leading,
        maskWidth,
        class: className,
        style,
        ...elementProps
      } = props;

      const textStyle = useTextStyle(style);

      const layoutWidth = useTextLayoutWidth();

      const { tokens } = useTheme();

      const source = isActive
        ? getShadTokens(leading, active)
        : { leading: [leading, active], tokens: [] };

      const font = `${textStyle.fontSize}:${textStyle.fontFamily}:${textStyle.fontWeight}:${textStyle.fontStyle}:${textStyle.letterSpacing}:${textStyle.lineHeight}`;

      const layout = `${font}:${layoutWidth}`;

      const content = {
        leading: source.leading,
        tokens: source.tokens.flatMap((token) => {
          const previous = wrapped.value[token.key];

          return previous?.font === layout && token.text === previous.text
            ? splitShadToken(token, previous.ends)
            : [token];
        }),
      };

      const estimates = Object.fromEntries(
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
      );

      const measurements = Object.fromEntries(
        content.tokens.map((token) => {
          const { width, prefix } = estimates[token.key]!;

          const current = widths.value[token.key];

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

      const onMeasure = (
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

        const previous = widths.value;

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
          return;

        widths.value = { ...next, [key]: measurement };
      };

      const onWrap = (key: string, text: string, measuredFont: string, ends: number[]) => {
        if (
          ends.length <= 1 ||
          measuredFont !== layout ||
          !source.tokens.some((token) => token.key === key && token.text === text)
        )
          return;

        // Preserve normal word boundaries. Only split words that the host has
        // already wrapped, at the host's actual line boundaries. This preserves
        // shaping within each line while preventing the mask from restarting.
        wrapped.value = {
          ...pick(
            wrapped.value,
            source.tokens.map((token) => token.key),
          ),
          [key]: { text, font: layout, ends },
        };
      };

      return (
        <AnimatedText
          {...attrs}
          {...elementProps}
          class={joinClassNames('fluxdown-shad', className)}
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
                class="fluxdown-shad-active"
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
                      layout,
                      detail.lines.map((line) => line.end),
                    )
                  }
                >
                  {token.children}
                </AnimatedText>
                {token.prefixText.length > 0 && (
                  <view
                    accessibility-elements-hidden={true}
                    class="fluxdown-shad-prefix"
                    bindlayoutchange={({ detail }) =>
                      onMeasure(token.key, token.text, token.prefixText, font, {
                        prefix: detail.width,
                      })
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
            class="fluxdown-shad-mask"
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
  },
  {
    name: 'FluxdownShadRenderer',
    props: ['Raw', 'active', 'isActive', 'leading', 'maskWidth', 'class', 'style'],
    inheritAttrs: false,
  },
);
