import cn from 'classnames';
import { useMemo } from 'react';

import { getTexRoot, type TexProps } from '../../../../../../../base';
import { texToSvg } from '../../../mathjax';
import styles from '../../index.module.scss';

export const MathjaxTexRenderer = ({
  className,
  mode = 'inline',
  parents,
  style,
  tex,
}: TexProps) => {
  const html = useMemo(() => texToSvg(tex, mode), [mode, tex]);
  const Root = getTexRoot(mode, parents);

  return (
    <Root
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
