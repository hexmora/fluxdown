import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { LinkProps } from '../../../../../base';

import { normalizePublicUrl } from '../../../../../base';
import styles from './index.module.scss';

export const LinkRenderer = (props: LinkProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'href',
    'onClick',
    'parents',
    'render',
  ]);

  return (
    <a
      {...elementProps}
      class={cn(styles.root, local.class)}
      href={normalizePublicUrl(local.href, { allowHash: true, allowMailto: true })}
      onClick={(event) => local.onClick?.({ event })}
    >
      {local.children}
    </a>
  );
};
