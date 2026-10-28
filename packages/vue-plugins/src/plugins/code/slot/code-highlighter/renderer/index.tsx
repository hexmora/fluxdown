import type { VNodeChild } from 'vue';

import cn from 'classnames';

import type { CodeHighlighterProps } from '../../../../../base';

import styles from './index.module.scss';

export const CodeHighlighterRenderer = ({
  Raw: _Raw,
  children,
  class: className,
  code,
  language = 'plaintext',
  meta: _meta,
  suffix,
  ...elementProps
}: CodeHighlighterProps & { children?: VNodeChild }) => {
  return (
    // Keyboard users need to focus the overflow container to scroll long lines.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <pre {...elementProps} class={cn(styles.root, className)} tabindex={0}>
      <code class={language ? `language-${language}` : undefined}>
        {children ?? code}
        {suffix}
      </code>
    </pre>
  );
};

CodeHighlighterRenderer.inheritAttrs = false;
