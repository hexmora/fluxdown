import cn from 'classnames';

import type { TexProps } from '../../../../../base';

import styles from '../../index.module.scss';

export const LightTexRenderer = ({
  Raw: _Raw,
  current: _current,
  parents: _parents,
  render: _render,
  className,
  mode = 'inline',
  style,
  tex,
  ...elementProps
}: TexProps) => {
  const Root = mode === 'display' ? 'div' : 'span';

  return (
    <Root {...elementProps} className={cn(styles.root, className)} data-mode={mode} style={style}>
      {tex}
    </Root>
  );
};
