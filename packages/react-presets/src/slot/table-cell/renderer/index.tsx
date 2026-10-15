import { isElementWithTag } from '@fluxdown/react-base-presets/base';
import { assert } from '@fluxdown/utils';
import { createElement } from 'react';

import type { TableCellProps } from '../../../base';

import { getReactProps } from '../../../base';

export const TableCellRenderer = ({
  Raw: _Raw,
  current: node,
  parents: _parents,
  render: _render,
  renderChildren,
  ...props
}: TableCellProps) => {
  assert(isElementWithTag(node, 'td', 'th'));

  const elementProps = { ...getReactProps(node), ...props };

  return createElement(node.tagName, elementProps, renderChildren(node));
};
