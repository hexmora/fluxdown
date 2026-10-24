import type { Link, Paragraph, PhrasingContent, Root, Text } from 'mdast';
import type { Position } from 'unist';

import { processMdast } from '@fluxdown/mdast';

import { AUTOLINK_PREFIX_ONLY, AUTOLINK_TRANSFORMS, CJK_AUTOLINK_BOUNDARY } from './consts';

const getAutolinkText = (node: Link, source: string): Text | undefined => {
  const child = node.children[0];

  if (node.children.length !== 1 || child?.type !== 'text') {
    return;
  }

  if (
    node.position &&
    child.position &&
    (node.position.start.offset !== child.position.start.offset ||
      node.position.end.offset !== child.position.end.offset)
  ) {
    return;
  }

  const start = node.position?.start.offset;

  if (start !== undefined && (source[start] === '[' || source[start] === '<')) {
    return;
  }

  const { value } = child;

  if (
    (/^https?:\/\//i.test(value) && node.url === value) ||
    (/^www\./i.test(value) && node.url === `http://${value}`) ||
    node.url === `mailto:${value}`
  ) {
    return child;
  }
};

const getPosition = (
  node: Link,
  value: string,
  source: string,
  offset: number,
  length: number,
): Position | undefined => {
  const start = node.position?.start;
  const end = node.position?.end;

  if (
    start?.offset === undefined ||
    end?.offset === undefined ||
    source.slice(start.offset, end.offset) !== value
  ) {
    return;
  }

  return {
    start: { ...start, column: start.column + offset, offset: start.offset + offset },
    end: {
      ...start,
      column: start.column + offset + length,
      offset: start.offset + offset + length,
    },
  };
};

const linkifyText = (value: string): PhrasingContent[] => {
  const paragraph: Paragraph = { type: 'paragraph', children: [{ type: 'text', value }] };

  if (!AUTOLINK_PREFIX_ONLY.test(value)) {
    const tree: Root = { type: 'root', children: [paragraph] };

    for (const transform of AUTOLINK_TRANSFORMS) {
      transform(tree);
    }
  }

  return paragraph.children;
};

export const splitCjkAutolinks = (tree: Root, source: string) => {
  processMdast({
    node: tree,
    allows: 'link',
    runner: ({ node, insertNext, skipTree }) => {
      if (node.type !== 'link') {
        return;
      }

      const text = getAutolinkText(node, source);
      const boundary = text?.value.search(CJK_AUTOLINK_BOUNDARY) ?? -1;

      if (!text || boundary <= 0) {
        return;
      }

      const { value } = text;
      const label = value.slice(0, boundary);
      const position = getPosition(node, value, source, 0, boundary);
      const children: PhrasingContent[] = [
        AUTOLINK_PREFIX_ONLY.test(label)
          ? { type: 'text', value: label, position }
          : {
              ...node,
              url: node.url.slice(0, node.url.length - value.length + boundary),
              children: [{ ...text, value: label, position }],
              position,
            },
      ];
      let offset = boundary;

      // Reuse GFM's text transform without interpreting the swallowed suffix as Markdown.
      for (const part of value.slice(boundary).split(CJK_AUTOLINK_BOUNDARY)) {
        if (!part) {
          continue;
        }

        for (const child of linkifyText(part)) {
          const content = child.type === 'link' ? child.children[0] : child;

          if (content?.type !== 'text') {
            continue;
          }

          const childPosition = getPosition(node, value, source, offset, content.value.length);

          child.position = childPosition;
          content.position = childPosition;
          children.push(child);
          offset += content.value.length;
        }
      }

      insertNext(children, true);
      skipTree();
    },
  });
};
