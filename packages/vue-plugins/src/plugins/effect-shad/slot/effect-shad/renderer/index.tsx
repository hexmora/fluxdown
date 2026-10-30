import type { CSSProperties } from 'vue';

import cn from 'classnames';
import { computed, defineComponent } from 'vue';

import type { ShadRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ShadRenderer = /*#__PURE__*/ defineComponent(
  (props: ShadRendererProps) => {
    // Negative delay resumes the original fade when reparsing remounts an inline element, so
    // each character keeps its own clock instead of following the reveal position.
    const delay = computed(() =>
      props.start >= 0 ? Math.min(0, props.start - performance.now()) : 0,
    );

    return () => {
      const { children, start, duration } = props;

      const active = start >= 0 && delay.value > -duration;

      const style = {
        [`--${PREFIX}-shad-duration`]: `${duration}ms`,
        animationDelay: `${delay.value}ms`,
      } as CSSProperties;

      return (
        <span
          class={cn(styles.root, active && styles.active)}
          data-fluxdown-shad="fade"
          key={start}
          style={style}
        >
          {children}
        </span>
      );
    };
  },
  { name: 'FluxdownShad', props: ['children', 'start', 'duration'], inheritAttrs: false },
);
