import type { VNodeChild } from 'vue';

import { computed, defineComponent, Fragment, isVNode, Text } from 'vue';

import type { ScaleProps } from '../../../../../base';

import { AnimatedText, joinClassNames, useTextStyleSource } from '../../../../../base';
import { getAppearKeyframes, useScaleAnimation } from './animation';
import './style.scss';

export type ScaleRendererProps = Omit<ScaleProps, 'Raw'> & { Raw?: ScaleProps['Raw'] };

const isTextOnly = (children: VNodeChild): boolean =>
  Array.isArray(children)
    ? children.every(isTextOnly)
    : isVNode(children)
      ? (children.type === Text || children.type === Fragment) &&
        isTextOnly(children.children as VNodeChild)
      : children === null ||
        children === undefined ||
        typeof children === 'string' ||
        typeof children === 'number' ||
        typeof children === 'boolean';

export const ScaleRenderer = /*#__PURE__*/ defineComponent(
  (props: ScaleRendererProps, { attrs, slots }) => {
    const textStyle = useTextStyleSource(() => props.style);

    const fontSize = computed(() => textStyle.value.fontSize);

    const appear = computed(() => getAppearKeyframes(props.blur, fontSize.value));

    const grow = computed(() => [{ transform: `scale(${props.from})` }, { transform: 'scale(1)' }]);

    const appearRef = useScaleAnimation(() => ({
      keyframes: appear.value,
      start: props.start,
      duration: props.duration,
      easing: 'linear',
    }));

    const growRef = useScaleAnimation(() => ({
      keyframes: grow.value,
      start: props.start,
      duration: props.duration,
      easing: 'cubic-bezier(0.333333, 1, 0.666667, 1)',
    }));

    return () => {
      const {
        Raw: _Raw,
        children,
        start,
        duration: _duration,
        from: _from,
        blur: _blur,
        class: className,
        style: _style,
        ...elementProps
      } = props;

      const content = slots.default?.() ?? children;

      return (
        <view
          {...attrs}
          {...elementProps}
          class={joinClassNames('fluxdown-scale', className)}
          key={start}
          main-thread-ref={appearRef}
          style={textStyle.value}
        >
          <view class="fluxdown-scale-glyph" main-thread-ref={growRef} style={textStyle.value}>
            <AnimatedText measureLayout={!isTextOnly(content)} style={textStyle.value}>
              {content}
            </AnimatedText>
          </view>
        </view>
      );
    };
  },
  {
    name: 'FluxdownScaleRenderer',
    props: ['Raw', 'children', 'start', 'duration', 'from', 'blur', 'class', 'style'],
    inheritAttrs: false,
  },
);
