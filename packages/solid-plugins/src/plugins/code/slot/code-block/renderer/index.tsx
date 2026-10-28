import cn from 'classnames';
import { Show, splitProps } from 'solid-js';

import type { CodeBlockProps } from '../../../../../base';

import { createTypeOfSlot } from '../../../../../base';
import styles from './index.module.scss';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const CodeHighlighter = /*#__PURE__*/ createTypeOfSlot('CodeHighlighter');

export const CodeBlockRenderer = (props: CodeBlockProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'class',
    'code',
    'language',
    'loading',
    'meta',
    'onCopy',
    'showHeader',
    'suffix',
  ]);

  return (
    <div
      {...elementProps}
      class={cn(styles.root, local.class)}
      aria-busy={local.loading || undefined}
    >
      <Show when={local.showHeader !== false}>
        <CodeHeader
          code={local.code}
          language={local.language}
          meta={local.meta}
          onCopy={local.onCopy}
        />
      </Show>
      <CodeHighlighter
        code={local.code}
        language={local.language}
        meta={local.meta}
        suffix={local.suffix}
      />
    </div>
  );
};
