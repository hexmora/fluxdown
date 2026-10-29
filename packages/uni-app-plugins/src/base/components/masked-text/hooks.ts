import { uniqueId } from 'lodash-es';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import type { Band, MaskedTextProps } from './type';

import { getBands, toText } from './utils';

export const useMask = (props: MaskedTextProps) => {
  const id = uniqueId('fluxdown-mask-');

  const textId = `${id}-text`;

  const maskId = `${id}-mask`;

  const trailingId = `${id}-trailing`;

  const bands = ref<Band[]>([]);

  const size = ref({ width: 0, height: 0 });

  const masked = computed(() => props.maskText.length > 0);

  const text = computed(() => toText(props.text));

  const maskText = computed(() => toText(props.maskText));

  const trailingText = computed(() => toText(`${props.text}${props.trailingText ?? ''}`));

  const fontSize = computed(() => parseFloat(String(props.textStyle.fontSize ?? 16)));

  const padding = computed(() => (props.textStyle.fontStyle === 'italic' ? fontSize.value / 4 : 0));

  const measurementWidth = computed(() =>
    Math.ceil(
      Math.max(props.maskText.length, props.text.length + (props.trailingText?.length ?? 0), 1) *
        fontSize.value *
        2 +
        padding.value * 2,
    ),
  );

  const pixelRatio = uni.getWindowInfo().pixelRatio;

  let generation = 0;

  let disposed = false;

  const measure = async () => {
    const current = ++generation;

    if (!masked.value) {
      bands.value = [];

      return;
    }

    await nextTick();

    const word = uni.getElementById(textId);

    const mask = uni.getElementById(maskId);

    const trailing = uni.getElementById(trailingId);

    if (!word || !mask || !trailing || disposed) {
      return;
    }

    const rects = await Promise.all([
      word.getBoundingClientRectAsync(),
      mask.getBoundingClientRectAsync(),
      trailing.getBoundingClientRectAsync(),
    ]);

    if (disposed || current !== generation || !rects[0] || !rects[1] || !rects[2]) {
      return;
    }

    const [box, maskBox, trailingBox] = rects;

    size.value = { width: box.width, height: box.height };

    bands.value = getBands({
      width: box.width,
      maskWidth: maskBox.width,
      maskEnd: trailingBox.width,
      padding: padding.value,
      pixelRatio,
    });
  };

  onMounted(measure);

  watch(
    [
      () => props.text,
      () => props.maskText,
      () => props.trailingText,
      () => props.textStyle.fontFamily,
      () => props.textStyle.fontSize,
      () => props.textStyle.fontWeight,
      () => props.textStyle.fontStyle,
      () => props.textStyle.lineHeight,
      () => props.textStyle.letterSpacing,
    ],
    measure,
    { flush: 'post' },
  );

  onUnmounted(() => {
    disposed = true;

    generation += 1;
  });

  return {
    textId,
    maskId,
    trailingId,
    bands,
    size,
    masked,
    text,
    maskText,
    trailingText,
    measurementWidth,
  };
};
