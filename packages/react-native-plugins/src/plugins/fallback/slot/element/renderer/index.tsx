import { View } from 'react-native';

import type { ElementProps } from '../../../../../base';

import { BLOCK_TAG_NAMES, InheritedText, useTheme } from '../../../../../base';

export const ElementRenderer = ({
  children,
  tagName,
  nativeID,
  checked,
}: ElementProps & { checked?: boolean }) => {
  const { tokens } = useTheme();

  if (['script', 'style', 'iframe', 'object', 'embed'].includes(tagName)) {
    return null;
  }

  if (tagName === 'hr') {
    return (
      <View
        style={{
          height: 1,
          marginVertical: tokens.spacing.xl,
          backgroundColor: tokens.colors.border,
        }}
      />
    );
  }

  if (tagName === 'input') {
    return (
      <InheritedText
        accessibilityRole="checkbox"
        aria-checked={checked}
        aria-disabled
        style={{ color: tokens.colors.accent }}
      >
        {checked ? '☑ ' : '☐ '}
      </InheritedText>
    );
  }

  if (tagName === 'tr') {
    return <View style={{ flexDirection: 'row' }}>{children}</View>;
  }

  if (BLOCK_TAG_NAMES.includes(tagName) || ['thead', 'tbody', 'tfoot'].includes(tagName)) {
    return <View nativeID={nativeID}>{children}</View>;
  }

  return (
    <InheritedText
      nativeID={nativeID}
      style={{
        fontFamily:
          tagName === 'code' || tagName === 'kbd' ? tokens.typography.fontMono : undefined,
        fontSize: tagName === 'code' ? tokens.code.fontSize : undefined,
        backgroundColor: tagName === 'code' ? tokens.colors.surfaceMuted : undefined,
        textDecorationLine:
          tagName === 'del' || tagName === 's'
            ? 'line-through'
            : tagName === 'u'
              ? 'underline'
              : undefined,
      }}
    >
      {children}
    </InheritedText>
  );
};
