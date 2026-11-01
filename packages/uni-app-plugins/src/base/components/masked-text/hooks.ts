import { uniqueId } from 'lodash-es';
import { computed, nextTick, onUnmounted, shallowRef, watch } from 'vue';

import type { MaskedTextProps, Measurements, RevealedText } from './type';

import { toText } from '../inherited-text/utils';
import { MEASUREMENT_NAMES } from './consts';
import { getMaskFrame } from './utils';

export const useMask = (props: MaskedTextProps) => {
  const id = uniqueId('fluxdown-mask-');

  const pixelRatio = uni.getWindowInfo().pixelRatio;

  const text = computed(() => toText(props.text));

  const ids = { text: `${id}-text`, mask: `${id}-mask`, trailing: `${id}-trailing` };

  const measurements = shallowRef<Measurements>({ text: null, mask: null, trailing: null });

  const drawing = shallowRef(false);

  const bandCount = shallowRef(0);

  const frame = shallowRef(
    getMaskFrame({ width: 0, height: 0, maskWidth: 0, maskEnd: 0, padding: 0, pixelRatio }),
  );

  const measurement = computed(() => {
    const fontSize = parseFloat(String(props.textStyle.fontSize ?? 16));

    const padding = props.textStyle.fontStyle === 'italic' ? fontSize / 4 : 0;

    return {
      textId: ids.text,
      maskId: ids.mask,
      trailingId: ids.trailing,
      text: toText(props.text),
      maskText: toText(props.maskText),
      trailingText: toText(`${props.text}${props.trailingText ?? ''}`),
      width: Math.ceil(
        Math.max(props.maskText.length, props.text.length + (props.trailingText?.length ?? 0), 1) *
          fontSize *
          2 +
          padding * 2,
      ),
      textStyle: props.textStyle,
      padding,
    };
  });

  let generation = 0;

  let seedGeneration = 0;

  let disposed = false;

  let retryFrame: number | undefined;

  let revealed: RevealedText | undefined;

  const publish = async () => {
    if (disposed) {
      return;
    }

    const current = ++generation;

    const masking = props.maskText.length > 0;

    const { text: word, mask, trailing } = measurements.value;

    if (
      !word ||
      word.width <= 0 ||
      word.height <= 0 ||
      (masking &&
        (!mask || mask.width <= 0 || mask.height <= 0 || !trailing || trailing.height <= 0))
    ) {
      return;
    }

    const font = [
      props.textStyle.fontFamily,
      props.textStyle.fontSize,
      props.textStyle.fontWeight,
      props.textStyle.fontStyle,
      props.textStyle.lineHeight,
      props.textStyle.letterSpacing,
    ];

    const previous = revealed;

    if (
      previous &&
      (!props.text.startsWith(previous.text) ||
        !font.every((value, index) => value === previous.font[index]))
    ) {
      revealed = undefined;
    }

    // Resuming an append must not shade the prefix already revealed during a pause.
    const next = getMaskFrame(
      {
        width: word.width,
        height: word.height,
        maskWidth: masking ? mask!.width : 0,
        maskEnd: masking ? trailing!.width : 0,
        padding: measurement.value.padding,
        pixelRatio,
      },
      revealed?.start,
    );

    if (!masking) {
      revealed = { text: props.text, start: next.start, font };
    }

    frame.value = next;

    if (next.activeWidth > 0) {
      bandCount.value = Math.max(bandCount.value, Math.ceil(next.activeWidth / next.step));

      drawing.value = true;

      return;
    }

    if (drawing.value) {
      const painted = nextTick();

      await painted;

      if (disposed || current !== generation) {
        return;
      }

      drawing.value = false;

      bandCount.value = 0;
    }
  };

  const names = MEASUREMENT_NAMES;

  const observers = names.map(
    (name) =>
      new UniResizeObserver((entries) => {
        if (disposed) {
          return;
        }

        const box = entries[0]?.borderBoxSize[0];

        if (!box || box.blockSize <= 0) {
          return;
        }

        measurements.value = {
          ...measurements.value,
          [name]: { width: box.inlineSize, height: box.blockSize },
        };
      }),
  );

  const seed = async (elements: UniElement[], current: number) => {
    if (disposed || current !== seedGeneration) {
      return;
    }

    const pending = names.flatMap((name, index) =>
      measurements.value[name] ? [] : [{ name, element: elements[index]! }],
    );

    if (!pending.length) {
      return;
    }

    const rects = await Promise.all(
      pending.map(({ element }) => element.getBoundingClientRectAsync()),
    );

    if (disposed || current !== seedGeneration) {
      return;
    }

    const next = { ...measurements.value };

    let changed = false;

    pending.forEach(({ name }, index) => {
      const rect = rects[index];

      if (next[name] || !rect || rect.height <= 0) {
        return;
      }

      next[name] = { width: rect.width, height: rect.height };

      changed = true;
    });

    if (changed) {
      measurements.value = next;
    }

    if (names.some((name) => !next[name])) {
      retryFrame = requestAnimationFrame(() => {
        if (disposed || current !== seedGeneration) {
          return;
        }

        retryFrame = undefined;

        void seed(elements, current);
      });
    }
  };

  const observe = () => {
    if (disposed) {
      return;
    }

    const elements = names.map((name) => uni.getElementById(ids[name]));

    if (elements.every((element): element is UniElement => element !== null)) {
      elements.forEach((element, index) => observers[index]!.observe(element));

      void seed(elements, ++seedGeneration);

      return;
    }

    retryFrame = requestAnimationFrame(() => {
      if (disposed) {
        return;
      }

      retryFrame = undefined;

      observe();
    });
  };

  void Promise.resolve().then(observe);

  watch(
    [
      measurements,
      () => props.text,
      () => props.maskText,
      () => props.trailingText,
      () => props.tail,
      () => props.textStyle.fontFamily,
      () => props.textStyle.fontSize,
      () => props.textStyle.fontWeight,
      () => props.textStyle.fontStyle,
      () => props.textStyle.lineHeight,
      () => props.textStyle.letterSpacing,
    ],
    publish,
    { flush: 'pre' },
  );

  onUnmounted(() => {
    disposed = true;

    generation += 1;

    seedGeneration += 1;

    for (const observer of observers) {
      observer.disconnect();
    }

    if (retryFrame !== undefined) {
      cancelAnimationFrame(retryFrame);
    }
  });

  return { measurement, text, frame, drawing, bandCount };
};
