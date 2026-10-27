import type { ReactNode } from '@lynx-js/react';
import type { CSSProperties } from '@lynx-js/types';
import type { ElementContent } from 'hast';

import type { ElementProps, ThemeTokens } from '../../../../../base';

import {
  AnimatedText,
  isBlockElement,
  isElementWithTag,
  isHastElement,
  joinClassNames,
  mapTokensToStyles,
  TextStyleProvider,
  useBlockStyle,
  useTextStyle,
  useTheme,
} from '../../../../../base';

const getFontSize = (size: string, parentSize: CSSProperties['fontSize']): string =>
  /^\d*\.?\d+em$/.test(size) && typeof parentSize === 'string' && parentSize.endsWith('px')
    ? `${parseFloat(size) * parseFloat(parentSize)}px`
    : size;

const getInlineCodeStyle = (
  tokens: ThemeTokens,
  parentSize: CSSProperties['fontSize'],
): CSSProperties => {
  const variables = mapTokensToStyles(tokens);

  const resolve = (value: string): string =>
    value.replace(/var\((--[\w-]+)\)/g, (reference, name: keyof CSSProperties) =>
      String(variables[name] ?? reference),
    );

  const fontSize = getFontSize(resolve(tokens.inlineCode.fontSize), parentSize);

  return {
    fontFamily: resolve(tokens.inlineCode.fontFamily),
    fontSize,
    background: resolve(tokens.inlineCode.background),
    border: resolve(tokens.inlineCode.border),
    borderRadius: resolve(tokens.inlineCode.borderRadius),
    padding: `${getFontSize(resolve(tokens.inlineCode.paddingBlock), fontSize)} ${getFontSize(resolve(tokens.inlineCode.paddingInline), fontSize)}`,
    whiteSpace: tokens.inlineCode.whiteSpace === 'nowrap' ? 'nowrap' : 'normal',
  };
};

const getLineHeight = ({ fontSize, lineHeight }: CSSProperties): number => {
  if (!/^\d+(?:\.\d+)?(?:px)?$/.test(String(fontSize))) return Number.NaN;

  const size = parseFloat(String(fontSize));

  return typeof lineHeight === 'string' && lineHeight.endsWith('px')
    ? parseFloat(lineHeight)
    : size * Number(lineHeight);
};

const getInlineBoxMargin = (inline: CSSProperties, parent: CSSProperties): string | undefined => {
  const padding = String(inline.padding).split(/\s+/);

  const lengths = [
    padding[0] ?? '0',
    padding[2] ?? padding[0] ?? '0',
    inline.border === 'none' ? '0' : String(inline.border).split(/\s+/)[0]!,
  ];

  if (!lengths.every((length) => /^\d+(?:\.\d+)?(?:px)?$/.test(length))) return undefined;

  const [top, bottom, border] = lengths.map(parseFloat) as [number, number, number];

  const excess = getLineHeight(inline) + top + bottom + 2 * border - getLineHeight(parent);

  // Inline padding paints outside a Web line box. Native attachments include
  // their box in line height, so remove only the excess over the parent line.
  return Number.isFinite(excess) ? `${-Math.max(0, excess)}px` : undefined;
};

export const ElementRenderer = ({
  Raw: _Raw,
  checked: _checked,
  children,
  className,
  columns: _columns,
  current,
  parents,
  render: _render,
  start: _start,
  style,
  tagName,
  ...elementProps
}: ElementProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  const textStyle = useTextStyle(style);

  if (['script', 'style', 'iframe', 'object', 'embed', 'input', 'meta', 'link'].includes(tagName)) {
    return null;
  }

  if (tagName === 'hr') {
    return (
      <view
        {...elementProps}
        className={joinClassNames('fluxdown-divider', className)}
        style={{
          ...blockStyle,
          height: tokens.divider.height,
          marginLeft: tokens.divider.marginInline,
          marginRight: tokens.divider.marginInline,
          border: tokens.divider.border,
          borderBottom: tokens.divider.borderBlockEnd,
          background: tokens.divider.background,
          ...style,
        }}
      />
    );
  }

  if (tagName === 'li' && current.type === 'element') {
    const parent = parents.at(-1);

    const ordered = parent && isHastElement(parent) && parent.tagName === 'ol';

    const siblings =
      parent?.children.filter((child): child is ElementContent => child.type === 'element') ?? [];

    const first = current.children.find((child) => child.type !== 'text' || child.value.trim());

    const checkbox =
      first && isElementWithTag(first, 'input')
        ? first
        : first && isElementWithTag(first, 'p')
          ? first.children.find((child) => isElementWithTag(child, 'input'))
          : undefined;

    const start = parent && isHastElement(parent) ? Number(parent.properties.start ?? 1) : 1;

    const depth = parents.filter(
      (node) => isHastElement(node) && isElementWithTag(node, 'ul', 'ol'),
    ).length;

    const marker = checkbox
      ? checkbox.type === 'element' && checkbox.properties.checked
        ? '☑'
        : '☐'
      : ordered
        ? `${start + siblings.findIndex((node) => node === current)}.`
        : depth > 2
          ? '▪'
          : depth === 2
            ? '◦'
            : '•';

    const renderedChildren = Array.isArray(children) ? children : [children];

    const content: ReactNode[] = [];

    let inline: ReactNode[] = [];

    const flushInline = () => {
      if (!inline.length) {
        return;
      }

      content.push(
        <AnimatedText key={`inline-${content.length}`} style={textStyle}>
          {inline}
        </AnimatedText>,
      );

      inline = [];
    };

    for (const [index, child] of current.children.entries()) {
      if (child.type === 'text' && !child.value.trim()) {
        const previous = current.children[index - 1];

        const next = current.children[index + 1];

        if (!previous || !next || isBlockElement(previous) || isBlockElement(next)) {
          continue;
        }
      }

      if (isBlockElement(child)) {
        flushInline();

        content.push(<view key={`block-${content.length}`}>{renderedChildren[index]}</view>);

        continue;
      }

      inline.push(renderedChildren[index]);
    }

    flushInline();

    return (
      <view
        {...elementProps}
        className={joinClassNames('fluxdown-list-item', className)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          ...blockStyle,
          ...style,
        }}
      >
        <AnimatedText
          style={{
            ...textStyle,
            color: checkbox ? tokens.colors.accent : tokens.colors.fgMuted,
            fontWeight: String(tokens.typography.fontWeight.medium) as typeof textStyle.fontWeight,
            width: '20px',
            marginLeft: '-20px',
            flexShrink: 0,
          }}
        >
          {marker}
        </AnimatedText>
        <view
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            flexShrink: 1,
            minWidth: '0px',
            paddingLeft: tokens.spacing.xs,
          }}
        >
          {content}
        </view>
      </view>
    );
  }

  if (tagName === 'tr') {
    const siblings = parents.at(-1)?.children.filter((child) => child.type === 'element') ?? [];

    return (
      <view
        {...elementProps}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'row',
          backgroundColor:
            siblings.findIndex((node) => node === current) % 2
              ? tokens.colors.surfaceSubtle
              : undefined,
          ...style,
        }}
      >
        {children}
      </view>
    );
  }

  if (['thead', 'tbody', 'tfoot', 'div', 'section'].includes(tagName)) {
    const footnotes = current.type === 'element' && current.properties.dataFootnotes;

    const sectionTextStyle = footnotes
      ? {
          ...textStyle,
          color: tokens.footnotes.color,
          fontSize:
            tokens.footnotes.fontSize === 'var(--fluxdown-typography-font-size-sm)'
              ? tokens.typography.fontSize.sm
              : tokens.footnotes.fontSize,
        }
      : textStyle;

    return (
      <TextStyleProvider value={sectionTextStyle}>
        <view
          {...elementProps}
          className={className}
          style={{
            display: 'flex',
            flexDirection: 'column',
            ...(footnotes
              ? {
                  ...blockStyle,
                  paddingTop: tokens.footnotes.paddingTop,
                  borderTop: tokens.footnotes.borderTop,
                }
              : undefined),
            ...style,
          }}
        >
          {children}
        </view>
      </TextStyleProvider>
    );
  }

  const inlineStyle: CSSProperties =
    tagName === 'code'
      ? { ...textStyle, ...getInlineCodeStyle(tokens, textStyle.fontSize), ...style }
      : tagName === 'del' || tagName === 's'
        ? {
            ...textStyle,
            color: tokens.colors.fgMuted,
            textDecoration: 'line-through' as const,
          }
        : textStyle;

  const childTextStyle =
    tagName === 'code'
      ? { ...textStyle, fontFamily: inlineStyle.fontFamily, fontSize: inlineStyle.fontSize }
      : inlineStyle;

  // Web paints inline text boxes and preserves their word boundaries. Native
  // text needs attachments for padding and borders.
  if (
    tagName === 'code' &&
    !(typeof SystemInfo !== 'undefined' && String(SystemInfo.platform) === 'web')
  ) {
    const parts = Array.isArray(children) ? children : [children];

    if (parts.every((part) => typeof part === 'string')) {
      const value = parts.join('');

      const fragments =
        inlineStyle.whiteSpace === 'nowrap' ? [value] : (value.match(/\S+\s*|\s+/g) ?? []);

      const { border, borderRadius, ...fragmentStyle } = inlineStyle;

      const marginBottom = inlineStyle.marginBottom ?? getInlineBoxMargin(inlineStyle, textStyle);

      return (
        <TextStyleProvider value={childTextStyle}>
          <AnimatedText
            {...elementProps}
            className={joinClassNames('fluxdown-inline-code', className)}
            style={childTextStyle}
          >
            {fragments.map((fragment, index) => (
              <view
                key={index}
                style={{
                  ...fragmentStyle,
                  borderTop: border,
                  borderBottom: border,
                  borderLeft: index === 0 ? border : 'none',
                  borderRight: index === fragments.length - 1 ? border : 'none',
                  borderTopLeftRadius: index === 0 ? borderRadius : '0px',
                  borderBottomLeftRadius: index === 0 ? borderRadius : '0px',
                  borderTopRightRadius: index === fragments.length - 1 ? borderRadius : '0px',
                  borderBottomRightRadius: index === fragments.length - 1 ? borderRadius : '0px',
                  marginBottom,
                  verticalAlign: 'baseline',
                  overflow: 'visible',
                  maxWidth: '100%',
                  ...(index > 0
                    ? {
                        paddingLeft: '0px',
                      }
                    : undefined),
                  ...(index < fragments.length - 1
                    ? {
                        paddingRight: '0px',
                      }
                    : undefined),
                }}
              >
                <AnimatedText style={childTextStyle}>{fragment}</AnimatedText>
              </view>
            ))}
          </AnimatedText>
        </TextStyleProvider>
      );
    }
  }

  return (
    <TextStyleProvider value={childTextStyle}>
      <AnimatedText
        {...elementProps}
        className={
          tagName === 'code' ? joinClassNames('fluxdown-inline-code', className) : className
        }
        style={inlineStyle}
      >
        {children}
      </AnimatedText>
    </TextStyleProvider>
  );
};
