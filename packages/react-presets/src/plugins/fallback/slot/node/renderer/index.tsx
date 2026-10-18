import type { NodeProps } from '@fluxdown/react-presets/base';

import { isSafeTagName } from '@fluxdown/react-base-presets/base';
import { createElement } from 'react';

import { VOID_TAG_NAMES } from './consts';

export const NodeRenderer = ({ current: node, getProps, renderChildren }: NodeProps) => {
  if (node.type === 'text') {
    return node.value;
  }

  if (node.type !== 'element' || !isSafeTagName(node.tagName)) {
    return null;
  }

  const props = getProps(node);

  if (VOID_TAG_NAMES.includes(node.tagName)) {
    return createElement(node.tagName, props);
  }

  return createElement(node.tagName, props, renderChildren(node));
};
