import { Fragment } from 'react';
import { View } from 'react-native';

import type { ListProps } from '../../../../../base';

import { InheritedText, isHastElement, useTheme } from '../../../../../base';
import { styles } from './styles';
import { getListItems, isTaskItem } from './utils';

export const ListRenderer = ({ current, parents, render, type, nativeID }: ListProps) => {
  const { tokens } = useTheme();

  const items = getListItems(current);

  const start =
    current.type === 'element' && typeof current.properties.start === 'number'
      ? current.properties.start
      : 1;

  return (
    <View
      nativeID={nativeID}
      style={{
        marginVertical: parents.some((parent) => isHastElement(parent, 'li'))
          ? tokens.spacing.xs
          : tokens.spacing.md,
      }}
    >
      {items.map((item, index) => (
        <View key={index} style={[styles.row, { marginVertical: tokens.spacing.xs }]}>
          <InheritedText
            style={{
              width: tokens.spacing.xl,
              paddingRight: tokens.spacing.sm,
              color: tokens.colors.fgMuted,
              fontFamily: tokens.typography.fontSans,
              fontSize: tokens.typography.fontSize.md,
              lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.md,
              textAlign: 'right',
            }}
          >
            {isTaskItem(item) ? '' : type === 'ordered' ? `${start + index}.` : '•'}
          </InheritedText>
          <View style={[styles.content, { paddingLeft: tokens.spacing.xs }]}>
            <Fragment>{render(item)}</Fragment>
          </View>
        </View>
      ))}
    </View>
  );
};
