import { View } from 'react-native';

import type { ParagraphProps } from '../../../../../base';

import {
  InheritedText,
  isHastElement,
  isImageOnlyParagraph,
  isLastChild,
  useTheme,
} from '../../../../../base';

export const ParagraphRenderer = ({
  children,
  current,
  parents,
  nativeID,
  accessibilityLabel,
}: ParagraphProps) => {
  const { tokens } = useTheme();

  if (current.type === 'element' && isImageOnlyParagraph(current)) {
    return <View style={{ marginBottom: tokens.paragraph.marginBottom }}>{children}</View>;
  }

  return (
    <InheritedText
      nativeID={nativeID}
      accessibilityLabel={accessibilityLabel}
      style={{
        color: parents.some((parent) => isHastElement(parent, 'blockquote'))
          ? tokens.colors.fgMuted
          : tokens.colors.fg,
        fontFamily: tokens.typography.fontSans,
        fontSize: tokens.typography.fontSize.md,
        lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.md,
        marginTop: tokens.paragraph.marginTop,
        marginBottom:
          parents[parents.length - 1]?.type !== 'root' && isLastChild(current, parents)
            ? 0
            : tokens.paragraph.marginBottom,
      }}
    >
      {children}
    </InheritedText>
  );
};
