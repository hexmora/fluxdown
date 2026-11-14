import cn from 'classnames';
import { useEffect } from 'react';

import type { TexKatexRendererProps } from '../../type';

import { getTexRoot, useTexRenderResult } from '../../../../../../../base';
import { katexTexToHtml } from '../../../../../../../base/tex-katex';
import { TexRenderer } from '../../../../../../tex';
import styles from './index.module.scss';

const TexKatexRenderer = ({ Fallback = TexRenderer, ...props }: TexKatexRendererProps) => {
  const { className, mode = 'inline', parents, style } = props;

  const result = useTexRenderResult(props, katexTexToHtml);

  const { html } = result;

  useEffect(() => {
    void import('katex/dist/katex.min.css').catch(() => {
      // Keep formulas available when the optional stylesheet cannot load.
    });
  }, []);

  if (html === null) {
    return <Fallback {...props} />;
  }

  const Root = getTexRoot(mode, parents);

  return (
    <Root
      className={cn(styles.root, className)}
      dangerouslySetInnerHTML={{ __html: html }}
      data-mode={mode}
      data-tex={result.tex}
      style={style}
    />
  );
};

export default TexKatexRenderer;
