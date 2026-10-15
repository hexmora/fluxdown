import cn from 'classnames';
import { createElement, useMemo } from 'react';

import type { ImageProps } from '../../../base';

import { getReactProps, normalizePublicUrl } from '../../../base';
import styles from './index.module.scss';

export const ImageRenderer = ({ Raw: _Raw, ...props }: ImageProps) => {
  const {
    alt = '',
    className,
    current: _current,
    onClick,
    parents: _parents,
    render: _render,
    src,
    ...elementProps
  } = { ...getReactProps(props.current), ...props };

  const safeSrc = useMemo(() => normalizePublicUrl(src), [src]);

  const handleClick: React.MouseEventHandler<HTMLImageElement> | undefined = onClick
    ? (event) => onClick({ event })
    : undefined;

  return createElement('img', {
    ...elementProps,
    alt,
    className: cn(styles.root, className),
    onClick: handleClick,
    src: safeSrc,
  });
};
