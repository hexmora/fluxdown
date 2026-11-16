import cn from 'classnames';
import { useEffect, useMemo } from 'react';

import type { TexKatexRendererProps } from '../../type';

import { TexRenderer } from '../../../../../../tex';
import { getTexRoot } from '../../../../../../tex/utils';
import { katexTexToHtml } from '../../../../../utils';
import styles from './index.module.scss';

const TexKatexRenderer = ({ Fallback = TexRenderer, ...props }: TexKatexRendererProps) => {
  const { className, mode = 'inline', parents, style, tex } = props;

  const html = useMemo(() => katexTexToHtml(tex, mode), [tex, mode]);

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
      aria-label={tex}
      className={cn(styles.root, className)}
      dangerouslySetInnerHTML={{ __html: html }}
      data-mode={mode}
      data-tex={tex}
      /*
       * KaTeX emits HTML layout beside its own nested MathML. A MathML wrapper
       * would put those HTML nodes in the wrong namespace and alter their layout.
       */
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- This wrapper contains HTML, so its math semantics require a role.
      role="math"
      style={style}
    />
  );
};

export default TexKatexRenderer;
