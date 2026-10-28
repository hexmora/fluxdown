import cn from 'classnames';
import { createMemo, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { TexProps } from '../../../../../../../base';

import styles from '../../index.module.scss';
import { texToSvg } from './utils';

export const MathjaxTexRenderer = (props: TexProps) => {
  const html = createMemo(() => texToSvg(props.tex, props.mode ?? 'inline'));

  return (
    <Show
      when={html() !== null}
      fallback={
        <Dynamic
          component={props.mode === 'display' ? 'div' : 'span'}
          class={cn(styles.root, props.class)}
          data-formula-error
          data-mode={props.mode ?? 'inline'}
          data-tex={props.tex}
          style={props.style}
        >
          {props.tex}
        </Dynamic>
      }
    >
      <Dynamic
        component={props.mode === 'display' ? 'div' : 'span'}
        aria-label={props.tex}
        class={cn(styles.root, props.class)}
        data-mode={props.mode ?? 'inline'}
        data-tex={props.tex}
        role="math"
        style={props.style}
        innerHTML={html()!}
      />
    </Show>
  );
};

export default MathjaxTexRenderer;
