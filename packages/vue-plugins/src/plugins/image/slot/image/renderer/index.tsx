import cn from 'classnames';
import { h } from 'vue';

import type { ImageProps } from '../../../../../base';

import { normalizePublicUrl } from '../../../../../base';
import styles from './index.module.scss';

export const ImageRenderer = ({ Raw: _Raw, ...props }: ImageProps) => {
  const {
    alt = '',
    class: className,
    current: _current,
    onClick,
    parents: _parents,
    render: _render,
    src,
    ...elementProps
  } = props;

  const safeSrc = normalizePublicUrl(src);

  const handleClick: ((event: MouseEvent) => void) | undefined = onClick
    ? (event) => onClick({ event })
    : undefined;

  return h('img', {
    ...elementProps,
    alt,
    class: cn(styles.root, className),
    onClick: handleClick,
    src: safeSrc,
  });
};

ImageRenderer.inheritAttrs = false;
