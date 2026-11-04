import { getTime } from '@fluxdown/utils';
import { computed, defineComponent } from 'vue';

import type { ShadProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextAnimationProvider,
  useTextStyle,
} from '../../../../../base';
import './style.scss';

export type ShadRendererProps = Omit<ShadProps, 'Raw'> & { Raw?: ShadProps['Raw'] };

export const ShadRenderer = /*#__PURE__*/ defineComponent(
  (props: ShadRendererProps, { attrs, slots }) => {
    // Keep the original delay during updates, but resume at the current time after a remount.
    const delay = computed(() => (props.start >= 0 ? Math.min(0, props.start - getTime()) : 0));

    // Linear alpha over time reads as an even gradient across the tail at a steady pace.
    const animation = computed(() =>
      props.start >= 0
        ? {
            arrival: Date.now() + props.start - getTime(),
            duration: props.duration,
            easing: 'linear',
          }
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
              active ? 'fluxdown-shad fluxdown-shad-active' : 'fluxdown-shad',
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
    name: 'FluxdownShadRenderer',
    props: ['Raw', 'children', 'start', 'duration', 'class', 'style'],
    inheritAttrs: false,
  },
);
