import type { Element, Node, Parent, Text } from 'hast';

import { isString } from 'lodash-es';

const BLOCKED_TAG_NAMES = new Set([
  'base',
  'embed',
  'iframe',
  'link',
  'meta',
  'object',
  'script',
  'style',
  'svg',
]);

const TAG_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

export const isHastElement = (node: Node, tagName?: string): node is Element => {
  if (node.type !== 'element' || !('tagName' in node) || !isString(node.tagName)) {
    return false;
  }

  return tagName === undefined || node.tagName === tagName;
};

export const isHastParent = (node: Node): node is Parent => 'children' in node;

export const isHastText = (node: Node): node is Text => node.type === 'text';

export const isSafeTagName = (tagName: string) =>
  TAG_NAME_PATTERN.test(tagName) && !BLOCKED_TAG_NAMES.has(tagName);
