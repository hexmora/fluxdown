import cn from 'classnames';
import { isFunction } from 'lodash-es';
import { defineComponent } from 'vue';

import {
  type CodeHeaderAction,
  CodeHeaderInnerActionKey,
  type CodeHeaderProps,
} from '../../../../../base';
import { CheckIcon } from './assets/check';
import { CopyIcon } from './assets/copy';
import { useCopy } from './hooks';
import styles from './index.module.scss';
import { renderAction } from './utils';

export const CodeHeaderRenderer = /*#__PURE__*/ defineComponent(
  (props: CodeHeaderProps) => {
    const { copy, isCopied, isCopying } = useCopy(props);

    return () => {
      const {
        actions,
        class: className,
        code: _code,
        language,
        left,
        meta: _meta,
        onCopy: _onCopy,
        Raw: _Raw,
        ...elementProps
      } = props;

      const copyAction: CodeHeaderAction = {
        key: CodeHeaderInnerActionKey.Copy,
        target: (
          <button
            aria-label={isCopied.value ? 'Copied' : 'Copy'}
            aria-live="polite"
            disabled={isCopying.value}
            onClick={() => void copy()}
            type="button"
          >
            {isCopied.value ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
            {isCopied.value ? 'Copied' : 'Copy'}
          </button>
        ),
      };

      const resolvedActions = isFunction(actions)
        ? actions([copyAction])
        : [copyAction, ...(actions ?? [])];

      return (
        <div {...elementProps} class={cn(styles.root, className)}>
          <div class={styles.language}>{left ?? language ?? 'text'}</div>
          <div class={styles.actions}>{resolvedActions.map(renderAction)}</div>
        </div>
      );
    };
  },
  {
    name: 'FluxdownCodeHeader',
    props: ['Raw', 'actions', 'class', 'style', 'code', 'language', 'left', 'meta', 'onCopy'],
    inheritAttrs: false,
  },
);
