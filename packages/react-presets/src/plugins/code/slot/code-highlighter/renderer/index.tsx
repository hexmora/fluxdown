import type { ReactNode } from 'react';

import cn from 'classnames';

import type { CodeHighlighterProps } from '../../../../../base';

import styles from './index.module.scss';

export const CodeHighlighterRenderer = ({
  Raw: _Raw,
  children,
  className,
  code,
  language = 'plaintext',
  meta: _meta,
  suffix,
  ...elementProps
}: CodeHighlighterProps & { children?: ReactNode }) => (
  // Keyboard users need to focus the overflow container to scroll long lines.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  <pre {...elementProps} className={cn(styles.root, className)} tabIndex={0}>
    <code className={language ? `language-${language}` : undefined}>
      {children ?? code}
      {suffix}
    </code>
  </pre>
);
