import { RichText } from '@tarojs/components';
import cn from 'classnames';
import { useMemo } from 'react';

import type { TexKatexRendererProps } from './type';

import { TexRenderer } from '../../../../tex';
import styles from './index.module.scss';
import { katexTexToHtml } from './utils';

import 'katex/dist/katex.min.css';

export type { TexKatexRendererProps } from './type';

export const TexKatexRenderer = ({ Fallback = TexRenderer, ...props }: TexKatexRendererProps) => {
  const { className, mode = 'inline', style, tex } = props;

  const html = useMemo(() => katexTexToHtml(tex, mode), [mode, tex]);

  if (html === null) {
    return <Fallback {...props} />;
  }

  return (
    <RichText
      className={cn(styles.root, className)}
      data-mode={mode}
      data-tex={tex}
      nodes={html}
      style={style}
    />
  );
};
