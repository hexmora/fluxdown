import type { StrongProps } from '../../../../../base';

import { InheritedText, useTheme } from '../../../../../base';

export const StrongRenderer = ({ children }: StrongProps) => {
  const { tokens } = useTheme();

  return (
    <InheritedText style={{ fontWeight: tokens.typography.fontWeight.bold }}>
      {children}
    </InheritedText>
  );
};
