import { h } from 'vue';

import type { TableCellProps } from '../../../../../base';

export const TableCellRenderer = ({ Raw: _Raw, children, tagName, ...props }: TableCellProps) => {
  return h(tagName, props, [children]);
};

TableCellRenderer.inheritAttrs = false;
