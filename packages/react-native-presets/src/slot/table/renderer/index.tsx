import type { Element } from 'hast';

import { ScrollView, View } from 'react-native';

import type { TableProps } from '../../../base';

import { useNativeTheme } from '../../../base';

const getColumnCount = (node?: Element): number => {
  if (!node) {
    return 0;
  }

  const children = node.children.filter((child) => child.type === 'element');

  if (node.tagName === 'tr') {
    return children.filter((child) => child.tagName === 'td' || child.tagName === 'th').length;
  }

  return Math.max(0, ...children.map(getColumnCount));
};

export const TableRenderer = (props: TableProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = props;

  const { colors, styles } = useNativeTheme();

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{ flexGrow: 1 }}
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={{ marginVertical: 16 }}
    >
      <View
        style={[
          {
            flexGrow: 1,
            minWidth: getColumnCount(props.current) * 96 + 2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            overflow: 'hidden',
          },
          styles.table,
          style,
        ]}
      >
        {children}
      </View>
    </ScrollView>
  );
};
