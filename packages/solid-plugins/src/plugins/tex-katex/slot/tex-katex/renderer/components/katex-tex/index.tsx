import cn from 'classnames';
import { createMemo, onMount, Show, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { TexKatexRendererProps } from '../../type';

import { TexRenderer } from '../../../../../../tex';
import styles from './index.module.scss';
import { katexTexToHtml } from './utils';

const TexKatexRenderer = (props: TexKatexRendererProps) => {
  const [local, rest] = splitProps(props, ['Fallback']);

  const html = createMemo(() => katexTexToHtml(props.tex, props.mode ?? 'inline'));

  onMount(() => {
    void import('katex/dist/katex.min.css').catch(() => {
      // Keep formulas available when the optional stylesheet cannot load.
    });
  });

  return (
    <Show
      when={html() !== null}
      fallback={<Dynamic component={local.Fallback ?? TexRenderer} {...rest} />}
    >
      <Dynamic
        component={props.mode === 'display' ? 'div' : 'span'}
        class={cn(styles.root, props.class)}
        innerHTML={html()!}
        data-mode={props.mode ?? 'inline'}
        data-tex={props.tex}
        style={props.style}
      />
    </Show>
  );
};

export default TexKatexRenderer;
