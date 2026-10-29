import type { CSSProperties } from 'vue';

import { uniqueId } from 'lodash-es';
import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';

import type { ScaleTextProps } from './type';

import { MEASUREMENT_FONT_SIZE } from './consts';

export const useWidth = (props: ScaleTextProps) => {
  const id = uniqueId('fluxdown-scale-width-');

  const width = shallowRef<number>();

  const ratio = computed(
    () => MEASUREMENT_FONT_SIZE / parseFloat(String(props.textStyle.fontSize ?? 16)),
  );

  const style = computed<CSSProperties>(() => ({
    ...props.textStyle,
    fontSize: `${MEASUREMENT_FONT_SIZE}px`,
    lineHeight: `${MEASUREMENT_FONT_SIZE * 2}px`,
    letterSpacing: '0px',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    alignSelf: 'flex-start' as const,
    opacity: 0,
  }));

  let generation = 0;

  let disposed = false;

  const measure = async () => {
    const current = ++generation;

    await nextTick();

    const element = uni.getElementById(id);

    if (!element || disposed) {
      return;
    }

    const rect = await element.getBoundingClientRectAsync();

    if (rect && !disposed && current === generation) {
      width.value =
        rect.width / ratio.value + parseFloat(String(props.textStyle.letterSpacing ?? 0));
    }
  };

  onMounted(measure);

  watch(
    [
      () => props.text,
      () => props.textStyle.fontFamily,
      () => props.textStyle.fontSize,
      () => props.textStyle.fontWeight,
      () => props.textStyle.fontStyle,
      () => props.textStyle.letterSpacing,
    ],
    measure,
    { flush: 'post' },
  );

  onUnmounted(() => {
    disposed = true;

    generation += 1;
  });

  return { id, width, style };
};
