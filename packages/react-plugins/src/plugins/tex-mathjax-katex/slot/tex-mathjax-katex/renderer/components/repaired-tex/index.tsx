import cn from 'classnames';
import { useEffect } from 'react';

import { getTexRoot, type TexProps, useTexRenderResult } from '../../../../../../../base';
import { renderTex } from '../../../utils';
import styles from '../../index.module.scss';

const RepairedTexRenderer = (props: TexProps) => {
  const { className, mode = 'inline', parents, style, tex } = props;

  const result = useTexRenderResult(props, renderTex);

  useEffect(() => {
    void import('katex/dist/katex.min.css').catch(() => {
      // Rendering remains available if the optional stylesheet cannot load.
    });
  }, []);

  const Root = getTexRoot(mode, parents);

  return (
    <Root
      aria-label={result.html === null ? undefined : result.tex}
      className={cn(styles.root, className)}
      data-formula-error={result.html === null || undefined}
      data-mode={mode}
      data-tex={result.tex}
      role={result.html === null ? undefined : 'math'}
      style={style}
      {...(result.html === null
        ? { children: tex }
        : { dangerouslySetInnerHTML: { __html: result.html } })}
    />
  );
};

export default RepairedTexRenderer;
