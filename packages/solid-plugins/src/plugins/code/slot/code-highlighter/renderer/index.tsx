import type { JSX } from 'solid-js';

import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { CodeHighlighterProps } from '../../../../../base';

import styles from './index.module.scss';

export const CodeHighlighterRenderer = (
  props: CodeHighlighterProps & { children?: JSX.Element },
) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'code',
    'language',
    'meta',
    'suffix',
  ]);

  return (
    // Keyboard users need to focus the overflow container to scroll long lines.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <pre {...elementProps} class={cn(styles.root, local.class)} tabindex={0}>
      <code class={`language-${local.language ?? 'plaintext'}`}>
        {local.children ?? local.code}
        {local.suffix}
      </code>
    </pre>
  );
};
