import { useHighlighted } from '@fluxdown/react-base-presets/highlight';
import { useMemo } from 'react';
import { Platform, Text } from 'react-native';

import type { CodeHighlighterProps } from '../../../base';

import { useNativeTheme } from '../../../base';
import { createHighlightTheme } from './consts';

export const CodeHighlighterRenderer = ({
  code,
  suffix,
  language = 'plaintext',
  style,
  nativeID,
  testID,
  accessibilityLabel,
}: CodeHighlighterProps) => {
  const { colors, syntax, styles, selectable } = useNativeTheme();

  const theme = useMemo(() => createHighlightTheme(colors, syntax), [colors, syntax]);

  const tokens = useHighlighted(code, language, theme);

  return (
    <Text
      selectable={selectable}
      nativeID={nativeID}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          color: colors.text,
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          fontSize: 14,
          lineHeight: 23.1,
          padding: 16,
        },
        styles.code,
        style,
      ]}
    >
      {tokens
        ? tokens.flatMap((line, lineIndex) => [
            lineIndex > 0 ? '\n' : null,
            ...line.map((token) => (
              <Text
                key={token.offset}
                style={{
                  color: token.color,
                  fontStyle: (token.fontStyle ?? 0) & 1 ? 'italic' : undefined,
                  fontWeight: (token.fontStyle ?? 0) & 2 ? 'bold' : undefined,
                  textDecorationLine: (token.fontStyle ?? 0) & 4 ? 'underline' : undefined,
                }}
              >
                {token.content}
              </Text>
            )),
          ])
        : code}
      {suffix}
    </Text>
  );
};
