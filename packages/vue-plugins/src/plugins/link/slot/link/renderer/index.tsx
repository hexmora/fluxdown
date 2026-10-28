import cn from 'classnames';

import type { LinkProps } from '../../../../../base';

import { normalizePublicUrl } from '../../../../../base';
import styles from './index.module.scss';

export const LinkRenderer = ({ Raw: _Raw, ...props }: LinkProps) => {
  const {
    children,
    class: className,
    current: _current,
    href,
    onClick,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  const safeHref = normalizePublicUrl(href, { allowHash: true, allowMailto: true });

  const handleClick: ((event: MouseEvent) => void) | undefined = onClick
    ? (event) => onClick({ event })
    : undefined;

  return (
    <a {...elementProps} class={cn(styles.root, className)} href={safeHref} onClick={handleClick}>
      {children}
    </a>
  );
};

LinkRenderer.inheritAttrs = false;
