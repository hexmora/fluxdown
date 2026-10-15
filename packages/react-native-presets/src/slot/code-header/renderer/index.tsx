import { createElement, isValidElement } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import type { CodeHeaderProps } from '../../../base';

import { useNativeTheme } from '../../../base';

export const CodeHeaderRenderer = ({
  code,
  language,
  meta,
  actions,
  left,
  onCopy,
  style,
  nativeID,
  testID,
}: CodeHeaderProps) => {
  const { colors, styles } = useNativeTheme();

  const customActions = typeof actions === 'function' ? actions([]) : (actions ?? []);

  return (
    <View
      nativeID={nativeID}
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          minHeight: 44,
          gap: 12,
          backgroundColor: colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        styles.codeHeader,
        style,
      ]}
    >
      {(typeof left === 'string' || typeof left === 'number' ? <Text>{left}</Text> : left) ?? (
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            lineHeight: 16.8,
            fontWeight: '600',
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          }}
        >
          {language ?? 'text'}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {onCopy ? (
          <Pressable
            style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Copy code"
            onPress={() => onCopy({ code, language, meta })}
          >
            <Text
              style={{ color: colors.muted, fontSize: 12, lineHeight: 16.8, fontWeight: '600' }}
            >
              Copy
            </Text>
          </Pressable>
        ) : null}
        {customActions.map(({ key, target }) => (
          <View key={key}>
            {typeof target === 'function' ? (
              createElement(target)
            ) : typeof target === 'string' || typeof target === 'number' ? (
              <Text>{target}</Text>
            ) : isValidElement(target) ? (
              target
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};
