import cn from 'classnames';

import type { TexProps } from '../../../../../base';

import styles from './index.module.scss';

export const TexRenderer = ({ class: className, mode = 'inline', style, tex }: TexProps) => {
  const Root = mode === 'display' ? 'div' : 'span';

  return (
    <Root class={cn(styles.root, className)} data-mode={mode} style={style}>
      {tex}
    </Root>
  );
};

TexRenderer.inheritAttrs = false;
