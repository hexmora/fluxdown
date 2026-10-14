import type { Element } from 'hast';

import { Text, View } from 'react-native';

import type { TableCellProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';
import { renderBlocks } from '../../utils/blocks';

export const TableCellRenderer = (props: TableCellProps) => {
  const { current, render, renderChildren, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const node = current as Element;

  const { colors, styles, selectable } = useNativeTheme();

  const header = node.tagName === 'th';

  const row = props.parents.at(-1);

  const cells = row?.children.filter((child) => child.type === 'element');

  const lastColumn = cells?.at(-1) === current;

  const section = props.parents.at(-2);

  const rows = section?.children.filter((child) => child.type === 'element');

  const lastRow = rows?.at(-1) === row;

  const align = node.properties.align;

  const textAlign = align === 'left' || align === 'center' || align === 'right' ? align : undefined;

  return (
    <View
      nativeID={nativeID}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          minWidth: 96,
          width: `${100 / Math.max(cells?.length ?? 0, 1)}%`,
          flexShrink: 0,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRightWidth: lastColumn ? 0 : 1,
          borderBottomWidth: header || !lastRow ? 1 : 0,
          borderColor: colors.border,
          backgroundColor: header ? colors.surfaceMuted : undefined,
        },
        styles.tableCell,
        style,
      ]}
    >
      {renderBlocks(node.children, render, (children) => {
        const parent: Element = { type: 'element', tagName: 'span', properties: {}, children };

        return (
          <Text
            selectable={selectable}
            style={[
              {
                color: colors.text,
                fontSize: 14,
                lineHeight: 23.1,
                fontWeight: header ? '600' : '400',
                textAlign,
              },
              styles.text,
            ]}
          >
            {renderChildren(parent)}
          </Text>
        );
      })}
    </View>
  );
};
