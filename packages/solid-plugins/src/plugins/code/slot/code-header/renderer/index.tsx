import cn from 'classnames';
import { isFunction } from 'lodash-es';
import { createMemo, For, Show, splitProps } from 'solid-js';

import {
  type CodeHeaderAction,
  CodeHeaderInnerActionKey,
  type CodeHeaderProps,
} from '../../../../../base';
import { CheckIcon } from './assets/check';
import { CopyIcon } from './assets/copy';
import { createCopy } from './hooks';
import styles from './index.module.scss';
import { renderAction } from './utils';

export const CodeHeaderRenderer = (props: CodeHeaderProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'actions',
    'class',
    'code',
    'language',
    'left',
    'meta',
    'onCopy',
  ]);

  const { copy, isCopied, isCopying } = createCopy(props);

  const copyAction: CodeHeaderAction = {
    key: CodeHeaderInnerActionKey.Copy,
    target: (
      <button
        aria-label={isCopied() ? 'Copied' : 'Copy'}
        aria-live="polite"
        disabled={isCopying()}
        onClick={() => void copy()}
        type="button"
      >
        <Show when={isCopied()} fallback={<CopyIcon />}>
          <CheckIcon />
        </Show>
        {isCopied() ? 'Copied' : 'Copy'}
      </button>
    ),
  };

  const actions = createMemo(() => {
    return isFunction(local.actions)
      ? local.actions([copyAction])
      : [copyAction, ...(local.actions ?? [])];
  });

  return (
    <div {...elementProps} class={cn(styles.root, local.class)}>
      <div class={styles.language}>{local.left ?? local.language ?? 'text'}</div>
      <div class={styles.actions}>
        <For each={actions()}>{renderAction}</For>
      </div>
    </div>
  );
};
