import { Image } from '@tarojs/components';
import cn from 'classnames';
import { useMemo, useState } from 'react';

import type { ImageProps } from '../../../../../base';
import type { ImageSize } from './type';

import { normalizePublicUrl } from '../../../../../base';
import styles from './index.module.scss';

export const ImageRenderer = ({ Raw: _Raw, ...props }: ImageProps) => {
  const {
    alt = '',
    className,
    current: _current,
    height,
    onTap,
    parents: _parents,
    render: _render,
    src,
    style,
    width,
    ...elementProps
  } = props;

  const safeSrc = useMemo(() => normalizePublicUrl(src), [src]);

  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  const intrinsicWidth = imageSize?.src === safeSrc ? imageSize?.width : undefined;

  return (
    <Image
      {...elementProps}
      ariaLabel={alt}
      className={cn(styles.root, className)}
      data-tag="img"
      disableDefaultSize
      mode={height ? 'aspectFit' : 'widthFix'}
      onClick={onTap ? (event) => onTap({ event }) : undefined}
      onLoad={(event) => setImageSize({ src: safeSrc, width: Number(event.detail.width) })}
      src={safeSrc ?? ''}
      style={{ width: width ?? intrinsicWidth, height, ...style }}
    />
  );
};
