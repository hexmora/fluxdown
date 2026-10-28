import cn from 'classnames';
import { Show } from 'solid-js';

import type { ScaleRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ScaleRenderer = (props: ScaleRendererProps) => {
  return (
    <Show when={String(props.start)} keyed>
      {(start) => {
        const time = Number(start);

        const delay = time >= 0 ? Math.min(0, time - performance.now()) : 0;

        const style = () => {
          return {
            [`--${PREFIX}-scale-duration`]: `${props.duration}ms`,
            [`--${PREFIX}-scale-from`]: String(props.from),
            [`--${PREFIX}-scale-blur`]: `${props.blur}em`,
            'animation-delay': `${delay}ms`,
          };
        };

        return (
          <span
            class={cn(styles.root, time >= 0 && delay > -props.duration && styles.active)}
            style={style()}
          >
            <span class={styles.glyph}>{props.children}</span>
          </span>
        );
      }}
    </Show>
  );
};
