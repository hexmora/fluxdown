import { createTypeOfSlot } from '@fluxdown/react-base-presets/base';
import { ScrollView, View } from 'react-native';

import type { CodeBlockProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const CodeHighlighter = /*#__PURE__*/ createTypeOfSlot('CodeHighlighter');

export const CodeBlockRenderer = (props: CodeBlockProps) => {
  const {
    code,
    language,
    meta,
    loading,
    onCopy,
    showHeader = true,
    style,
    nativeID,
    testID,
    accessibilityLabel,
  } = { ...getReactNativeProps(props.current), ...props };

  const { colors, styles } = useNativeTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      accessibilityState={{ busy: loading }}
      style={[
        {
          backgroundColor: colors.codeBackground,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: loading ? colors.borderEmphasis : colors.border,
          overflow: 'hidden',
          marginVertical: 16,
        },
        styles.codeBlock,
        style,
      ]}
    >
      {showHeader ? (
        <CodeHeader code={code} language={language} meta={meta} onCopy={onCopy} />
      ) : null}
      <ScrollView horizontal>
        <CodeHighlighter code={code} language={language} meta={meta} />
      </ScrollView>
    </View>
  );
};
