import type { ReactNode } from '@lynx-js/react';
import type { CSSProperties } from '@lynx-js/types';
import type { ElementContent } from 'hast';

import type { ElementProps } from '../../../../../base';

import {
  isBlockElement,
  isElementWithTag,
  isHastElement,
  joinClassNames,
  TextStyleProvider,
  useBlockStyle,
  useTextStyle,
  useTheme,
} from '../../../../../base';

const getFontSize = (size: string, parentSize: CSSProperties['fontSize']): string =>
  /^\d*\.?\d+em$/.test(size) && typeof parentSize === 'string' && parentSize.endsWith('px')
    ? `${parseFloat(size) * parseFloat(parentSize)}px`
    : size;

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
        <text key={`inline-${content.length}`} style={textStyle}>
          {inline}
        </text>,
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
        <text
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
        </text>
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
      ? {
          ...textStyle,
          fontFamily: tokens.inlineCode.fontFamily,
          fontSize: getFontSize(tokens.inlineCode.fontSize, textStyle.fontSize),
          background: tokens.inlineCode.background,
          border: tokens.inlineCode.border,
          borderRadius: tokens.inlineCode.borderRadius,
          padding: `${tokens.inlineCode.paddingBlock} ${tokens.inlineCode.paddingInline}`,
          whiteSpace: tokens.inlineCode.whiteSpace === 'nowrap' ? 'nowrap' : 'normal',
          ...style,
        }
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

  return (
    <TextStyleProvider value={childTextStyle}>
      <text {...elementProps} className={className} style={inlineStyle}>
        {children}
      </text>
    </TextStyleProvider>
  );
};
