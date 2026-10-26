import { View } from 'react-native';

import type { CodeBlockProps } from '../../../../../base';

import { createTypeOfSlot, useTheme } from '../../../../../base';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const CodeHighlighter = /*#__PURE__*/ createTypeOfSlot('CodeHighlighter');

export const CodeBlockRenderer = ({
  code,
  language,
  loading,
  meta,
  onCopy,
  showHeader = true,
  suffix,
}: CodeBlockProps) => {
  const { tokens } = useTheme();

  return (
    <View
      accessibilityState={{ busy: loading }}
      style={{
        marginVertical: tokens.spacing.lg,
        borderWidth: 1,
        borderColor: loading ? tokens.colors.borderEmphasis : tokens.colors.border,
        borderRadius: tokens.radius.lg,
        backgroundColor: tokens.colors.surfaceSubtle,
        overflow: 'hidden',
      }}
    >
      {showHeader ? (
        <CodeHeader code={code} language={language} meta={meta} onCopy={onCopy} />
      ) : null}
      <CodeHighlighter code={code} language={language} meta={meta} suffix={suffix} />
    </View>
  );
};
