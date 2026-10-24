import { createElement } from 'react';

import type { TableCellProps } from '../../../../../base';

export const TableCellRenderer = ({ Raw: _Raw, children, tagName, ...props }: TableCellProps) =>
  createElement(tagName, props, children);
