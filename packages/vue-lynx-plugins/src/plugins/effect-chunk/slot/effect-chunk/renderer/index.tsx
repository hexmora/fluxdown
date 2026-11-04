import { getTime } from '@fluxdown/utils';
import { computed, defineComponent } from 'vue';

import type { ChunkProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextAnimationProvider,
  useTextStyle,
} from '../../../../../base';
import './style.scss';

export type ChunkRendererProps = Omit<ChunkProps, 'Raw'> & { Raw?: ChunkProps['Raw'] };

export const ChunkRenderer = /*#__PURE__*/ defineComponent(
  (props: ChunkRendererProps, { attrs, slots }) => {
    // Keep the original delay during updates, but resume at the current time after a remount.
    const delay = computed(() => (props.start >= 0 ? Math.min(0, props.start - getTime()) : 0));

    const animation = computed(() =>
      props.start >= 0
        ? { arrival: Date.now() + props.start - getTime(), duration: props.duration }
        : null,
    );

    return () => {
      const {
        Raw: _Raw,
        children,
        start,
        duration,
        class: className,
        style,
        ...elementProps
      } = props;

      const textStyle = useTextStyle(style);

      const active = start >= 0 && delay.value > -duration;

      return (
        <TextAnimationProvider value={animation.value}>
          <AnimatedText
            {...attrs}
            {...elementProps}
            class={joinClassNames(
              active ? 'fluxdown-chunk fluxdown-chunk-active' : 'fluxdown-chunk',
              className,
            )}
            key={start}
            style={textStyle}
          >
            {slots.default?.() ?? children}
          </AnimatedText>
        </TextAnimationProvider>
      );
    };
  },
  {
    name: 'FluxdownChunkRenderer',
    props: ['Raw', 'children', 'start', 'duration', 'class', 'style'],
    inheritAttrs: false,
  },
);
