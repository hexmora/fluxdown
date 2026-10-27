import { Linking } from 'react-native';

import type { LinkProps } from '../../../../../base';

import { InheritedText, useTheme } from '../../../../../base';

export const LinkRenderer = ({ children, href, onPress, title, nativeID }: LinkProps) => {
  const { tokens } = useTheme();

  return (
    <InheritedText
      accessibilityHint={title}
      accessibilityRole="link"
      nativeID={nativeID}
      onPress={(event) => {
        if (onPress) {
          onPress({ event });

          return;
        }

        void Linking.openURL(href).catch(() => undefined);
      }}
      style={{ color: tokens.colors.accent, textDecorationLine: 'underline' }}
    >
      {children}
    </InheritedText>
  );
};
