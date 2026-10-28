import cn from 'classnames';
import { renderAsync } from 'pele/lazy';
import { createEffect, createSignal, createUniqueId, onCleanup, Show, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { CodeBlockProps } from '../../../../../../../base';

import { createTypeOfSlot } from '../../../../../../../base';
import { DIAGRAM_OPTIONS } from './consts';
import styles from './index.module.scss';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const PeleRenderer = (props: CodeBlockProps) => {
  const idPrefix = createUniqueId();

  const [diagram, setDiagram] = createSignal<string | null>(null);

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

  createEffect(() => {
    const code = local.code;

    let active = true;

    onCleanup(() => {
      active = false;
    });

    if (!code.trim()) {
      setDiagram(null);

      return;
    }

    void renderAsync(code, { ...DIAGRAM_OPTIONS, idPrefix }).then(
      ({ svg }) => {
        if (active) {
          setDiagram(svg);
        }
      },
      () => {
        // Keep the last valid diagram while streamed syntax is incomplete.
      },
    );
  });

  return (
    <Show when={diagram()} fallback={<Dynamic component={local.Raw ?? undefined} {...props} />}>
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
        <figure class={styles.canvas} aria-label={local.meta || 'Diagram'} innerHTML={diagram()!} />
        {local.suffix}
      </div>
    </Show>
  );
};

export default PeleRenderer;
