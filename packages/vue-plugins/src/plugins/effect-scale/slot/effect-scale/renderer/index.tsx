import type { CSSProperties } from 'vue';

import cn from 'classnames';
import { computed, defineComponent } from 'vue';

import type { ScaleRendererProps } from './type';

import { PREFIX } from '../../../../../base';
import styles from './index.module.scss';

export const ScaleRenderer = /*#__PURE__*/ defineComponent(
  (props: ScaleRendererProps) => {
    const delay = computed(() =>
      props.start >= 0 ? Math.min(0, props.start - performance.now()) : 0,
    );

    return () => {
      const { children, start, duration, from, blur } = props;

      const active = start >= 0 && delay.value > -duration;

      const style = {
        [`--${PREFIX}-scale-duration`]: `${duration}ms`,
        [`--${PREFIX}-scale-from`]: from,
        [`--${PREFIX}-scale-blur`]: `${blur}em`,
        animationDelay: `${delay.value}ms`,
      } as CSSProperties;

      return (
        <span class={cn(styles.root, active && styles.active)} key={start} style={style}>
          <span class={styles.glyph}>{children}</span>
        </span>
      );
    };
  },
  {
    name: 'FluxdownScale',
    props: ['children', 'start', 'duration', 'from', 'blur'],
    inheritAttrs: false,
  },
);
