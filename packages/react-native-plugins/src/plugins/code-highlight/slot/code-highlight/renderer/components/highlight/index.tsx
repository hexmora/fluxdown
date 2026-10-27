import { useMemo } from 'react';
import { Text, View } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';

import type { CodeHighlighterProps } from '../../../../../../../base';

import { useTheme } from '../../../../../../../base';
import { createHighlightStyle } from './utils';

const HighlightRenderer = ({ code, language, suffix }: CodeHighlighterProps) => {
  const { tokens } = useTheme();

  const hljsStyle = useMemo(() => createHighlightStyle(tokens), [tokens]);

  return (
    <View>
      <CodeHighlighter
        hljsStyle={hljsStyle}
        language={language}
        textStyle={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.code.fontSize,
          lineHeight: tokens.code.fontSize * tokens.code.lineHeight,
          minHeight: tokens.code.fontSize * tokens.code.lineHeight,
          userSelect: 'text',
        }}
        scrollViewProps={{
          contentContainerStyle: {
            minWidth: '100%',
            padding: tokens.spacing.lg,
            backgroundColor: tokens.colors.surfaceSubtle,
          },
        }}
      >
        {code}
      </CodeHighlighter>
      {suffix ? <Text>{suffix}</Text> : null}
    </View>
  );
};

export default HighlightRenderer;
