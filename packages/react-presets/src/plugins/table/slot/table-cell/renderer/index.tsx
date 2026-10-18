import type { TableCellProps } from '@fluxdown/react-presets/base';

import { isElementWithTag } from '@fluxdown/react-base-presets/base';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';
import { createElement } from 'react';

export const TableCellRenderer = ({
  Raw: _Raw,
  current: node,
  parents: _parents,
  render: _render,
  renderChildren,
  ...props
}: TableCellProps) => {
  assert(isElementWithTag(node, 'td', 'th'));

  const align = node.properties.align;

  const elementProps: Record<string, unknown> = isString(align) ? { ...props, align } : props;

  return createElement(node.tagName, elementProps, renderChildren(node));
};
