import { useEffect, useState } from 'react';
import { Image, Pressable, Text } from 'react-native';

import type { ImageProps } from '../../../../../base';

import { isImageOnlyParagraph, useTheme } from '../../../../../base';
import { getDimension } from './utils';

export const ImageRenderer = ({ alt, height, onPress, parents, src, title, width }: ImageProps) => {
  const { tokens } = useTheme();

  const [size, setSize] = useState<{ src: string; width: number; height: number } | null>(null);

  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Image.getSize(
      src,
      (imageWidth, imageHeight) => {
        if (active) {
          setFailed(null);

          setSize({ src, width: imageWidth, height: imageHeight });
        }
      },
      () => {
        if (active) {
          setFailed(src);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [src]);

  if (failed === src) {
    return <Text style={{ color: tokens.colors.fgMuted }}>{alt ?? title ?? src}</Text>;
  }

  const current = size?.src === src ? size : null;

  const parent = parents[parents.length - 1];

  const block = parent ? isImageOnlyParagraph(parent) : false;

  const ratio = current ? current.width / current.height : 16 / 9;

  const image = (
    <Image
      accessible
      accessibilityLabel={alt ?? title}
      accessibilityRole="image"
      onError={() => setFailed(src)}
      resizeMode="contain"
      source={{ uri: src }}
      style={{
        width: getDimension(width) ?? (block ? '100%' : 160),
        height: getDimension(height) ?? (block ? undefined : 160 / ratio),
        aspectRatio: ratio,
        maxWidth: '100%',
        borderRadius: tokens.radius.md,
      }}
    />
  );

  if (!onPress) {
    return image;
  }

  return block ? (
    <Pressable accessibilityRole="button" onPress={(event) => onPress({ event })}>
      {image}
    </Pressable>
  ) : (
    <Text onPress={(event) => onPress({ event })}>{image}</Text>
  );
};
