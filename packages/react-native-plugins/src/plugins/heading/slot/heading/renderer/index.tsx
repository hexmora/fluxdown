import { useState } from 'react';

import type { HeadingProps } from '../../../../../base';
import type { ThemeTokens } from '../../../../../typings';

import { InheritedText, useTheme } from '../../../../../base';

export const HeadingRenderer = ({ children, level, nativeID }: HeadingProps) => {
  const { tokens } = useTheme();

  const [isFirst, setIsFirst] = useState(false);

  const safeLevel = Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1;

  const heading = tokens.heading[`h${safeLevel}` as keyof ThemeTokens['heading']];

  const marginTop = isFirst ? 0 : heading.marginTop;

  return (
    <InheritedText
      accessibilityRole="header"
      nativeID={nativeID}
      onLayout={({ nativeEvent: { layout } }) => {
        // HAST positions restart in each streaming block; use the native parent's flow.
        setIsFirst(layout.y === 0 || layout.y === marginTop);
      }}
      style={{
        color: safeLevel >= 5 ? tokens.colors.fgMuted : tokens.colors.fg,
        fontFamily: tokens.typography.fontSans,
        ...heading,
        marginTop,
        lineHeight: heading.fontSize * heading.lineHeight,
        letterSpacing: safeLevel <= 2 ? heading.fontSize * -0.025 : 0,
      }}
    >
      {children}
    </InheritedText>
  );
};
