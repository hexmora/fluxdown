import type { CSSProperties } from 'vue';

import cn from 'classnames';
import { computed, defineComponent } from 'vue';

import type { ChunkRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ChunkRenderer = /*#__PURE__*/ defineComponent(
  (props: ChunkRendererProps) => {
    const delay = computed(() =>
      props.start >= 0 ? Math.min(0, props.start - performance.now()) : 0,
    );

    return () => {
      const { children, start, duration } = props;

      const active = start >= 0 && delay.value > -duration;

      const style = {
        [`--${PREFIX}-chunk-duration`]: `${duration}ms`,
        animationDelay: `${delay.value}ms`,
      } as CSSProperties;

      return (
        <span
          class={cn(styles.root, active && styles.active)}
          data-fluxdown-chunk="1"
          key={start}
          style={style}
        >
          {children}
        </span>
      );
    };
  },
  { name: 'FluxdownChunk', props: ['children', 'start', 'duration'], inheritAttrs: false },
);
