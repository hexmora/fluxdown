import { useEffect, useState } from 'react';
import { Image, Pressable, Text } from 'react-native';

import type { ImageProps } from '../../../base';

import { getReactNativeProps, normalizePublicUrl, useNativeTheme } from '../../../base';

export const ImageRenderer = (props: ImageProps) => {
  const { src, alt, width, height, onPress, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { colors, styles } = useNativeTheme();

  const uri = normalizePublicUrl(src);

  const [size, setSize] = useState<{
    uri: string;

    width: number;

    height: number;
  } | null>(null);

  const needsSize = width === undefined || height === undefined;

  useEffect(() => {
    if (!uri || !needsSize) {
      return;
    }

    let active = true;

    Image.getSize(
      uri,
      (imageWidth, imageHeight) => {
        if (active && imageWidth > 0 && imageHeight > 0) {
          setSize({ uri, width: imageWidth, height: imageHeight });
        }
      },
      () => undefined,
    );

    return () => {
      active = false;
    };
  }, [uri, needsSize]);

  const natural = size?.uri === uri ? size : null;

  const aspectRatio = natural ? natural.width / natural.height : undefined;

  if (!uri) {
    return alt ? <Text>{alt}</Text> : null;
  }

  const image = (
    <Image
      accessible
      accessibilityLabel={accessibilityLabel ?? alt}
      accessibilityRole="image"
      nativeID={nativeID}
      testID={testID}
      resizeMode="contain"
      source={{ uri }}
      style={[
        {
          width: width ?? (height && aspectRatio ? height * aspectRatio : (natural?.width ?? 240)),
          height: height ?? (aspectRatio ? undefined : 160),
          aspectRatio: height === undefined ? aspectRatio : undefined,
          maxWidth: '100%',
          alignSelf: 'center',
          marginVertical: 16,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          backgroundColor: colors.codeBackground,
        },
        styles.image,
        style,
      ]}
    />
  );

  return onPress ? <Pressable onPress={onPress}>{image}</Pressable> : image;
};
