import cn from 'classnames';
import { Show } from 'solid-js';

import type { ChunkRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ChunkRenderer = (props: ChunkRendererProps) => {
  return (
    <Show when={String(props.start)} keyed>
      {(start) => {
        const time = Number(start);

        const delay = time >= 0 ? Math.min(0, time - performance.now()) : 0;

        return (
          <span
            class={cn(styles.root, time >= 0 && delay > -props.duration && styles.active)}
            data-fluxdown-chunk="1"
            style={{
              [`--${PREFIX}-chunk-duration`]: `${props.duration}ms`,
              'animation-delay': `${delay}ms`,
            }}
          >
            {props.children}
          </span>
        );
      }}
    </Show>
  );
};
