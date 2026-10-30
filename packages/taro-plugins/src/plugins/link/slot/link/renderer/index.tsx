import { Navigator } from '@tarojs/components';
import cn from 'classnames';
import { useMemo } from 'react';

import type { LinkProps } from '../../../../../base';

import { normalizePublicUrl, TextColorProvider, useTextColor } from '../../../../../base';
import styles from './index.module.scss';

export const LinkRenderer = ({ Raw: _Raw, ...props }: LinkProps) => {
  const {
    children,
    className,
    current: _current,
    href,
    onTap,
    parents: _parents,
    render: _render,
    ...elementProps
  } = props;

  const color = useTextColor('accent');

  const safeHref = useMemo(
    () => normalizePublicUrl(href, { allowHash: true, allowMailto: true }),
    [href],
  );

  return (
    <Navigator
      {...elementProps}
      className={cn(styles.root, className)}
      data-tag="a"
      onClick={onTap ? (event) => onTap({ event }) : undefined}
      url={safeHref ?? ''}
    >
      <TextColorProvider value={elementProps.style?.color ?? color}>{children}</TextColorProvider>
    </Navigator>
  );
};
