import cn from 'classnames';
import { renderAsync } from 'pele/lazy';
import { defineComponent, h, shallowRef, useId, watch } from 'vue';

import type { CodeBlockProps } from '../../../../../../../base';

import { createTypeOfSlot } from '../../../../../../../base';
import { DIAGRAM_OPTIONS } from './consts';
import styles from './index.module.scss';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const PeleRenderer = /*#__PURE__*/ defineComponent(
  (props: CodeBlockProps) => {
    const idPrefix = useId();

    const diagram = shallowRef<string | null>(null);

    watch(
      () => props.code,
      (code, _, onCleanup) => {
        let active = true;

        onCleanup(() => {
          active = false;
        });

        if (!code.trim()) {
          diagram.value = null;

          return;
        }

        void renderAsync(code, { ...DIAGRAM_OPTIONS, idPrefix }).then(
          ({ svg }) => {
            if (active) {
              diagram.value = svg;
            }
          },
          () => {
            // Keep the last valid diagram while streamed syntax is incomplete.
          },
        );
      },
      { immediate: true },
    );

    return () => {
      const {
        Raw,
        class: className,
        code,
        language,
        loading,
        meta,
        onCopy,
        showHeader = true,
        suffix,
        ...elementProps
      } = props;

      if (!diagram.value) {
        return Raw ? h(Raw, props) : null;
      }

      return (
        <div {...elementProps} class={cn(styles.root, className)} aria-busy={loading || undefined}>
          {showHeader ? (
            <CodeHeader code={code} language={language} meta={meta} onCopy={onCopy} />
          ) : null}
          <figure class={styles.canvas} aria-label={meta || 'Diagram'} innerHTML={diagram.value} />
          {suffix}
        </div>
      );
    };
  },
  {
    name: 'FluxdownPele',
    props: [
      'Raw',
      'class',
      'style',
      'code',
      'language',
      'loading',
      'meta',
      'onCopy',
      'showHeader',
      'suffix',
    ],
    inheritAttrs: false,
  },
);

export default PeleRenderer;
