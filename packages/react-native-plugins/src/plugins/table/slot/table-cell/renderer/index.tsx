import { View } from 'react-native';

import type { TableCellProps } from '../../../../../base';

import { InheritedText, useTheme } from '../../../../../base';

export const TableCellRenderer = ({ align, children, tagName }: TableCellProps) => {
  const { tokens } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: 120,
        paddingVertical: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.md,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: tokens.colors.border,
        backgroundColor: tagName === 'th' ? tokens.colors.surfaceMuted : undefined,
      }}
    >
      <InheritedText
        style={{
          color: tokens.colors.fg,
          fontFamily: tokens.typography.fontSans,
          fontSize: tokens.typography.fontSize.sm,
          lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.md,
          fontWeight: tagName === 'th' ? tokens.typography.fontWeight.medium : undefined,
          textAlign: align === 'center' || align === 'right' ? align : 'left',
        }}
      >
        {children}
      </InheritedText>
    </View>
  );
};
