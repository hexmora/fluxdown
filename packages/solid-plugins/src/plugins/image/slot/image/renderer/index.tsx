import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { ImageProps } from '../../../../../base';

import { normalizePublicUrl } from '../../../../../base';
import styles from './index.module.scss';

export const ImageRenderer = (props: ImageProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'alt',
    'class',
    'current',
    'onClick',
    'parents',
    'render',
    'src',
  ]);

  return (
    <img
      {...elementProps}
      alt={local.alt ?? ''}
      class={cn(styles.root, local.class)}
      onClick={(event) => local.onClick?.({ event })}
      src={normalizePublicUrl(local.src)}
    />
  );
};
