import { ScrollView, View } from 'react-native';

import type { TableProps } from '../../../../../base';

import { useTheme } from '../../../../../base';

export const TableRenderer = ({ children }: TableProps) => {
  const { tokens } = useTheme();

  return (
    <ScrollView
      horizontal
      style={{ marginVertical: tokens.spacing.lg }}
      contentContainerStyle={{ minWidth: '100%' }}
    >
      <View
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: tokens.colors.border,
          borderRadius: tokens.radius.lg,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
};
