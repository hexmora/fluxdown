import type { Element, ElementContent, Node, Parent, Text } from 'hast';

import { isString } from 'lodash-es';

export const isHastElement = (node: Node, tagName?: string): node is Element => {
  if (node.type !== 'element' || !('tagName' in node) || !isString(node.tagName)) {
    return false;
  }

  return tagName === undefined || node.tagName === tagName;
};

export const isHastParent = (node: Node): node is Parent => 'children' in node;

export const isHastText = (node: Node): node is Text => node.type === 'text';

export const isElementWithTag = <T extends string>(
  node: ElementContent,
  ...tagNames: readonly T[]
): node is Element & { tagName: T } =>
  node.type === 'element' && tagNames.some((tagName) => tagName === node.tagName);

export const getTextContent = (node: ElementContent): string => {
  if (node.type === 'text') {
    return node.value;
  }

  if (node.type !== 'element') {
    return '';
  }

  return node.children
    .map((child) =>
      child.type === 'text' || child.type === 'element' ? getTextContent(child) : '',
    )
    .join('');
};
