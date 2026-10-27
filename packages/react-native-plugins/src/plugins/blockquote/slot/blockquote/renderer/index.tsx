import { View } from 'react-native';

import type { BlockquoteProps } from '../../../../../base';

import { useTheme } from '../../../../../base';

export const BlockquoteRenderer = ({ children, nativeID }: BlockquoteProps) => {
  const { tokens } = useTheme();

  return (
    <View
      nativeID={nativeID}
      style={{
        marginVertical: tokens.spacing.lg,
        paddingVertical: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.lg,
        borderLeftWidth: 3,
        borderLeftColor: tokens.colors.borderEmphasis,
        borderTopRightRadius: tokens.radius.md,
        borderBottomRightRadius: tokens.radius.md,
        backgroundColor: tokens.colors.surfaceSubtle,
      }}
    >
      {children}
    </View>
  );
};
