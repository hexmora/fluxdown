import type { ElementContent } from 'hast';
import type { ReactNode } from 'react';

import { Fragment } from 'react';

import { InheritedText } from '../components';
import { useTheme } from '../theme';

export const BLOCK_TAG_NAMES = [
  'address',
  'article',
  'aside',
  'blockquote',
  'dd',
  'details',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'summary',
  'table',
  'ul',
];

export const InlineRenderer = ({ children }: { children?: ReactNode }) => {
  const { tokens } = useTheme();

  return (
    <InheritedText
      style={{
        color: tokens.colors.fg,
        fontFamily: tokens.typography.fontSans,
        fontSize: tokens.typography.fontSize.md,
        lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.md,
      }}
    >
      {children}
    </InheritedText>
  );
};

export const renderNativeChildren = (
  nodes: ElementContent[],
  render: (node: ElementContent) => ReactNode,
) => {
  const children: ReactNode[] = [];

  let inline: ReactNode[] = [];

  const flush = () => {
    if (inline.length > 0) {
      children.push(<InlineRenderer key={`inline:${children.length}`}>{inline}</InlineRenderer>);

      inline = [];
    }
  };

  nodes.forEach((node, index) => {
    const isBlock = node.type === 'element' && BLOCK_TAG_NAMES.includes(node.tagName);

    if (isBlock) {
      flush();

      children.push(<Fragment key={index}>{render(node)}</Fragment>);

      return;
    }

    if (inline.length === 0 && node.type === 'text' && node.value.trim() === '') {
      return;
    }

    inline.push(<Fragment key={index}>{render(node)}</Fragment>);
  });

  flush();

  return children;
};
