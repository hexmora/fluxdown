import { texToSvg } from '@fluxdown/react-base-presets/math';
import cn from 'classnames';
import { useMemo } from 'react';

import type { TexProps } from '../../../../../base';

import styles from '../../index.module.scss';

export const MathjaxTexRenderer = ({
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
  const html = useMemo(() => texToSvg(tex, mode), [mode, tex]);

  const Root = mode === 'display' ? 'div' : 'span';

  return (
    <Root
      {...elementProps}
      aria-label={html === null ? undefined : tex}
      className={cn(styles.root, className)}
      data-formula-error={html === null || undefined}
      data-mode={mode}
      data-tex={tex}
      role={html === null ? undefined : 'math'}
      style={style}
      {...(html === null ? { children: tex } : { dangerouslySetInnerHTML: { __html: html } })}
    />
  );
};

export default MathjaxTexRenderer;
