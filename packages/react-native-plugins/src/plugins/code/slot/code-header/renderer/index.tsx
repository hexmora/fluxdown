import { createElement, isValidElement } from 'react';
import { View } from 'react-native';

import type { CodeHeaderProps } from '../../../../../base';

import { InheritedText, useTheme } from '../../../../../base';
import { styles } from './styles';

export const CodeHeaderRenderer = ({ actions, language, left }: CodeHeaderProps) => {
  const { tokens } = useTheme();

  const resolvedActions = typeof actions === 'function' ? actions([]) : (actions ?? []);

  return (
    <View
      style={[
        styles.root,
        {
          minHeight: 44,
          paddingVertical: tokens.spacing.sm,
          paddingHorizontal: tokens.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: tokens.colors.border,
          backgroundColor: tokens.colors.surfaceMuted,
        },
      ]}
    >
      <InheritedText
        style={{
          color: tokens.colors.fgMuted,
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.fontSize.xs,
          lineHeight: tokens.typography.fontSize.xs * tokens.typography.lineHeight.sm,
          fontWeight: tokens.typography.fontWeight.medium,
        }}
      >
        {left ?? language ?? 'text'}
      </InheritedText>
      <View style={styles.actions}>
        {resolvedActions.map(({ key, target }) => (
          <View key={key}>
            {typeof target === 'function' ? (
              createElement(target)
            ) : isValidElement(target) ? (
              target
            ) : (
              <InheritedText>{target}</InheritedText>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
