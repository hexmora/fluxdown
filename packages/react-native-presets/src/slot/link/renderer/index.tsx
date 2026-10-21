import type { GestureResponderEvent } from 'react-native';

import { Fragment } from 'react';
import { Linking, Pressable, Text } from 'react-native';

import type { LinkProps } from '../../../base';

import { normalizePublicUrl, useNativeTheme } from '../../../base';
import { isBlockNode, renderBlocks } from '../../utils/blocks';

export const LinkRenderer = (props: LinkProps) => {
  const { children, href, title, onPress, style, nativeID, testID, accessibilityLabel } = props;

  const { colors, styles } = useNativeTheme();

  const url = normalizePublicUrl(href, { allowMailto: true, allowTel: true });

  const handlePress = url
    ? (event: GestureResponderEvent) => {
        if (onPress) {
          onPress(event);
        } else {
          void Linking.openURL(url).catch(() => undefined);
        }
      }
    : undefined;

  if (props.current?.type === 'element' && isBlockNode(props.current)) {
    return (
      <Pressable
        accessibilityRole={url ? 'link' : undefined}
        accessibilityHint={title}
        accessibilityLabel={accessibilityLabel}
        nativeID={nativeID}
        testID={testID}
        onPress={handlePress}
      >
        {renderBlocks(props.current.children, props.render, (nodes) => (
          <Text
            style={[{ color: colors.link, textDecorationLine: 'underline' }, styles.link, style]}
          >
            {nodes.map((node, index) => (
              <Fragment key={index}>{props.render(node)}</Fragment>
            ))}
          </Text>
        ))}
      </Pressable>
    );
  }

  return (
    <Text
      accessibilityRole={url ? 'link' : undefined}
      accessibilityHint={title}
      accessibilityLabel={accessibilityLabel}
      nativeID={nativeID}
      testID={testID}
      style={[
        url ? { color: colors.link, textDecorationLine: 'underline' } : undefined,
        styles.link,
        style,
      ]}
      onPress={handlePress}
    >
      {children}
    </Text>
  );
};
