import type { ReactRenderParams } from '@fluxdown/react-base-presets/base';
import type { ElementContent } from 'hast';
import type { ReactNode } from 'react';

import { Fragment } from 'react';

const BLOCK_TAGS = [
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'div',
  'dl',
  'dt',
  'dd',
  'figure',
  'figcaption',
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
  'img',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
];

export const isBlockNode = (node: ElementContent): boolean =>
  node.type === 'element' &&
  (BLOCK_TAGS.includes(node.tagName) ||
    node.properties.dataType === 'block-math' ||
    node.children.some(isBlockNode));

export const renderBlocks = (
  children: ElementContent[],
  render: ReactRenderParams['render'],
  renderInline: (children: ElementContent[]) => ReactNode = (nodes) =>
    render({ type: 'element', tagName: 'p', properties: {}, children: nodes }),
): ReactNode[] => {
  const result: ReactNode[] = [];

  let inline: ElementContent[] = [];

  const flush = () => {
    if (inline.some((node) => node.type !== 'text' || node.value.trim())) {
      result.push(<Fragment key={result.length}>{renderInline(inline)}</Fragment>);
    }

    inline = [];
  };

  for (const child of children) {
    if (isBlockNode(child)) {
      flush();

      result.push(<Fragment key={result.length}>{render(child)}</Fragment>);
    } else {
      inline.push(child);
    }
  }

  flush();

  return result;
};
