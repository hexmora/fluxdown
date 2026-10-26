import type { TexProps } from '../../../../../base';

import { InheritedText, useTheme } from '../../../../../base';

export const TexRenderer = ({ mode, tex }: TexProps) => {
  const { tokens } = useTheme();

  return (
    <InheritedText
      style={{
        color: tokens.colors.fg,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.code.fontSize,
        lineHeight: tokens.code.fontSize * tokens.code.lineHeight,
        marginVertical: mode === 'display' ? tokens.spacing.lg : 0,
        textAlign: mode === 'display' ? 'center' : undefined,
      }}
    >
      {tex}
    </InheritedText>
  );
};
