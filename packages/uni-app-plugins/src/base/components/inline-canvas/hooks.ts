import { getTime } from '@fluxdown/utils';
import { uniqueId } from 'lodash-es';
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import type { InlineCanvasProps } from './type';

import { drawText, getFontSize, getProgress } from './utils';

export const useDrawing = (props: InlineCanvasProps) => {
  const id = uniqueId('fluxdown-canvas-');

  const textId = `${id}-text`;

  const component = getCurrentInstance()?.proxy;

  const size = ref({ width: 0, height: 0 });

  const complete = ref(getProgress(props.start, props.duration, getTime()) === 1);

  const ready = ref(false);

  const failed = ref(false);

  const padding = computed(() => Math.ceil(props.blur * getFontSize(props.textStyle) * 3) + 1);

  const active = computed(() => !failed.value && (!complete.value || props.maskText !== undefined));

  const opacity = computed(() => {
    if (!active.value) {
      return 1;
    }

    if (ready.value) {
      return 0;
    }

    if (props.maskText !== undefined) {
      return 0;
    }

    const progress = getProgress(props.start, props.duration, getTime());

    return Math.pow(1 - Math.pow(1 - progress, 3), 2);
  });

  const canvasStyle = computed(() => ({
    position: 'absolute' as const,
    left: `${-padding.value}px`,
    top: `${-padding.value}px`,
    width: `${size.value.width + padding.value * 2}px`,
    height: `${size.value.height + padding.value * 2}px`,
  }));

  let context: CanvasRenderingContext2D | null = null;

  let requestFrame: typeof requestAnimationFrame;

  let cancelFrame: typeof cancelAnimationFrame | undefined;

  let frame: number | null = null;

  let frameGeneration = 0;

  let measuring = false;

  let disposed = false;

  let measurement = 0;

  const pixelRatio = uni.getWindowInfo().pixelRatio;

  const cancelDrawing = () => {
    frameGeneration += 1;

    if (frame !== null) {
      cancelFrame?.(frame);

      frame = null;
    }
  };

  const scheduleDrawing = () => {
    if (frame !== null) {
      return;
    }

    const current = frameGeneration;

    frame = requestFrame(() => {
      if (disposed || current !== frameGeneration) {
        return;
      }

      frame = null;

      draw();
    });
  };

  const draw = () => {
    if (!context || disposed || measuring) {
      return;
    }

    const progress = getProgress(props.start, props.duration, getTime());

    complete.value = progress === 1;

    if (complete.value && props.maskText === undefined) {
      context = null;

      ready.value = false;

      return;
    }

    drawText(context, props, size.value, padding.value, pixelRatio, progress);

    ready.value = true;

    if (!complete.value) {
      scheduleDrawing();
    }
  };

  const resize = () => {
    if (!context) {
      return;
    }

    const width = Math.ceil((size.value.width + padding.value * 2) * pixelRatio);

    const height = Math.ceil((size.value.height + padding.value * 2) * pixelRatio);

    if (context.canvas.width !== width || context.canvas.height !== height) {
      context.canvas.width = width;

      context.canvas.height = height;
    }

    const { textStyle } = props;

    context.font = `${textStyle.fontStyle ?? 'normal'} ${textStyle.fontWeight ?? '400'} ${getFontSize(textStyle)}px ${textStyle.fontFamily ?? 'sans-serif'}`;

    context.textBaseline = 'middle';

    scheduleDrawing();
  };

  const measure = async () => {
    cancelDrawing();

    const current = ++measurement;

    measuring = true;

    complete.value = getProgress(props.start, props.duration, getTime()) === 1;

    if (!active.value) {
      measuring = false;

      context = null;

      ready.value = false;

      return;
    }

    await nextTick();

    const element = uni.getElementById(textId);

    if (!element || disposed) {
      if (current === measurement) {
        measuring = false;
      }

      return;
    }

    const rect = await element.getBoundingClientRectAsync();

    if (disposed || current !== measurement) {
      return;
    }

    if (!rect) {
      measuring = false;

      return;
    }

    size.value = { width: rect.width, height: rect.height };

    await nextTick();

    if (disposed || current !== measurement) {
      return;
    }

    if (context) {
      measuring = false;

      resize();

      return;
    }

    uni.createCanvasContextAsync({
      id,
      component,
      success(canvas) {
        if (disposed || current !== measurement) {
          return;
        }

        requestFrame = (callback) => canvas.requestAnimationFrame(callback);

        cancelFrame = (handle) => canvas.cancelAnimationFrame(handle);

        context = canvas.getContext('2d');

        measuring = false;

        if (!context) {
          failed.value = true;

          return;
        }

        resize();
      },
      fail() {
        if (disposed || current !== measurement) {
          return;
        }

        measuring = false;

        failed.value = true;
      },
    });
  };

  onMounted(measure);

  watch(
    [
      () => props.text,
      () => props.textStyle.fontFamily,
      () => props.textStyle.fontSize,
      () => props.textStyle.fontWeight,
      () => props.textStyle.fontStyle,
      () => props.textStyle.lineHeight,
      () => props.textStyle.letterSpacing,
      () => props.start,
      () => props.duration,
      () => props.from,
      () => props.blur,
    ],
    measure,
    { flush: 'post' },
  );

  watch(
    [
      () => props.maskText,
      () => props.trailingText,
      () => props.textStyle.color,
      () => props.textStyle.opacity,
    ],
    () => {
      // Text geometry and mask updates can arrive in the same Vue flush.
      if (measuring) {
        return;
      }

      if (context) {
        scheduleDrawing();
      } else {
        void measure();
      }
    },
    { flush: 'post' },
  );

  onUnmounted(() => {
    disposed = true;

    cancelDrawing();

    measurement += 1;

    context = null;
  });

  return { id, textId, active, opacity, canvasStyle };
};
