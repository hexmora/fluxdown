import type { CSSProperties, LayoutChangeEvent, TextProps } from '@lynx-js/types';
import type { VNodeChild } from 'vue';

import {
  computed,
  createVNode,
  defineComponent,
  Fragment,
  isVNode,
  normalizeClass,
  shallowRef,
  Text,
} from 'vue';

import {
  TextLayoutWidthProvider,
  useTextAnimationSource,
  useTextLayoutWidthSource,
} from '../../context';
import { useTextStyleSource } from '../../theme';
import { useTextAnimationRef } from './animation';

const renderText = (children: VNodeChild): VNodeChild => {
  if (Array.isArray(children)) {
    return children.map(renderText);
  }

  if (isVNode(children) && children.type === Text) {
    return createVNode('raw-text', {
      key: children.key ?? undefined,
      text: String(children.children ?? ''),
    });
  }

  if (isVNode(children) && children.type === Fragment) {
    return createVNode(
      Fragment,
      { key: children.key ?? undefined },
      renderText(children.children as VNodeChild),
    );
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return createVNode('raw-text', { text: children });
  }

  return children;
};

type AnimatedTextProps = Omit<TextProps, 'children' | 'style' | 'class'> & {
  children?: VNodeChild;

  style?: CSSProperties;

  /** Leaf glyphs can inherit the surrounding text width without reporting their own layout. */
  measureLayout?: boolean;
};

/** Native inline text cannot animate opacity; animate each resolved foreground instead. */
export const AnimatedText = /*#__PURE__*/ defineComponent(
  (props: AnimatedTextProps, { attrs, slots }) => {
    const animation = useTextAnimationSource();

    const parentWidth = useTextLayoutWidthSource();

    const layoutWidth = shallowRef<number>();

    const inherited = useTextStyleSource();

    const color = computed(() => props.style?.color ?? inherited.value.color);

    const native = computed(() => {
      const value = animation?.value;

      return value && 'arrival' in value ? value : null;
    });

    const element = useTextAnimationRef(() => ({
      arrival: native.value?.arrival ?? -1,
      duration: native.value?.duration ?? 0,
      easing: native.value?.easing ?? 'cubic-bezier(0, 0, 0.58, 1)',
      color: color.value,
    }));

    const onLayoutChange = (event: LayoutChangeEvent) => {
      const width = event.detail.width;

      layoutWidth.value =
        typeof width === 'number' && Number.isFinite(width) && width > 0 ? width : undefined;

      props.bindlayoutchange?.(event);
    };

    return () => {
      const { children, style, bindlayoutchange, measureLayout = true, ...elementProps } = props;

      return (
        <TextLayoutWidthProvider
          value={measureLayout ? (layoutWidth.value ?? parentWidth?.value) : parentWidth?.value}
        >
          <text
            text-fake-bold={true}
            {...attrs}
            {...elementProps}
            class={normalizeClass(attrs.class)}
            bindlayoutchange={measureLayout ? onLayoutChange : bindlayoutchange}
            main-thread-ref={native.value ? element : undefined}
            style={style}
          >
            {renderText(slots.default?.() ?? children)}
          </text>
        </TextLayoutWidthProvider>
      );
    };
  },
  {
    name: 'FluxdownAnimatedText',
    props: ['children', 'style', 'bindlayoutchange', 'measureLayout'],
    inheritAttrs: false,
  },
);
