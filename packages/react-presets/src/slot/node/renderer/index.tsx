import { isSafeTagName } from '@fluxdown/react-base-presets/base';
import { createElement } from 'react';

import type { NodeProps } from '../../../base';

import { getReactProps } from '../../../base';
import { VOID_TAG_NAMES } from './consts';

export const NodeRenderer = ({
  Raw: _Raw,
  current: node,
  parents: _parents,
  render: _render,
  renderChildren,
  ...elementProps
}: NodeProps) => {
  if (node.type === 'text') {
    return node.value;
  }

  if (node.type !== 'element' || !isSafeTagName(node.tagName)) {
    return null;
  }

  const props = { ...getReactProps(node), ...elementProps };

  if (VOID_TAG_NAMES.includes(node.tagName)) {
    return createElement(node.tagName, props);
  }

  return createElement(node.tagName, props, renderChildren(node));
};
