import cn from 'classnames';
import { Show } from 'solid-js';

import type { ShadRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ShadRenderer = (props: ShadRendererProps) => {
  return (
    <Show when={String(props.start)} keyed>
      {(start) => {
        const time = Number(start);

        // Negative delay resumes the original fade when reparsing remounts an inline element, so
        // each character keeps its own clock instead of following the reveal position.
        const delay = time >= 0 ? Math.min(0, time - performance.now()) : 0;

        return (
          <span
            class={cn(styles.root, time >= 0 && delay > -props.duration && styles.active)}
            data-fluxdown-shad="fade"
            style={{
              [`--${PREFIX}-shad-duration`]: `${props.duration}ms`,
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
