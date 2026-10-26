import type { ReactNode } from 'react';

import { ScrollView } from 'react-native';

import type { CodeHighlighterProps } from '../../../../../base';

import { InheritedText, useTheme } from '../../../../../base';

export const CodeHighlighterRenderer = ({
  children,
  code,
  suffix,
}: CodeHighlighterProps & { children?: ReactNode }) => {
  const { tokens } = useTheme();

  return (
    <ScrollView horizontal contentContainerStyle={{ minWidth: '100%', padding: tokens.spacing.lg }}>
      <InheritedText
        selectable
        style={{
          color: tokens.colors.fg,
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.code.fontSize,
          lineHeight: tokens.code.fontSize * tokens.code.lineHeight,
        }}
      >
        {children ?? code}
        {suffix}
      </InheritedText>
    </ScrollView>
  );
};
