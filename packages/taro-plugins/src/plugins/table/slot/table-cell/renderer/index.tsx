import { View } from '@tarojs/components';

import type { TableCellProps } from '../../../../../base';

export const TableCellRenderer = ({
  Raw: _Raw,
  align,
  children,
  style,
  tagName,
  ...props
}: TableCellProps) => {
  const textAlign =
    align === 'left' || align === 'center' || align === 'right' ? align : style?.textAlign;

  return (
    <View {...props} data-tag={tagName} style={{ ...style, textAlign }}>
      {children}
    </View>
  );
};
