import cn from 'classnames';
import { useEffect, useMemo } from 'react';

import type { TexKatexRendererProps } from '../../type';

import { TexRenderer } from '../../../../../../tex';
import styles from './index.module.scss';
import { katexTexToHtml } from './utils';

const TexKatexRenderer = ({ Fallback = TexRenderer, ...props }: TexKatexRendererProps) => {
  const { className, mode = 'inline', style, tex } = props;
  const html = useMemo(() => katexTexToHtml(tex, mode), [mode, tex]);

  useEffect(() => {
    void import('katex/dist/katex.min.css').catch(() => {
      // Keep formulas available when the optional stylesheet cannot load.
    });
  }, []);

  if (html === null) {
    return <Fallback {...props} />;
  }

  const Root = mode === 'display' ? 'div' : 'span';

  return (
    <Root
      className={cn(styles.root, className)}
      dangerouslySetInnerHTML={{ __html: html }}
      data-mode={mode}
      data-tex={tex}
      style={style}
    />
  );
};

export default TexKatexRenderer;
