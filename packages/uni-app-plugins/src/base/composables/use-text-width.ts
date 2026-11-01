import type { CSSProperties } from 'vue';

import { getTextUnits } from '@fluxdown/hast';
import { uniqueId } from 'lodash-es';
import { computed, onUnmounted, shallowRef } from 'vue';

import type { TextWidthProps } from './type';

import { toText } from '../components/inherited-text/utils';
import { MEASUREMENT_REPETITIONS } from './consts';

export const useTextWidth = (props: TextWidthProps) => {
  const id = uniqueId('fluxdown-text-width-');

  const advance = shallowRef<number>();

  const width = computed(() =>
    advance.value === undefined
      ? undefined
      : advance.value +
        [...getTextUnits(props.text)].length *
          parseFloat(String(props.textStyle.letterSpacing ?? 0)),
  );

  const text = computed(() => toText(props.text).repeat(MEASUREMENT_REPETITIONS));

  const maximumWidth = computed(
    () =>
      Math.max(1, props.text.length) *
      parseFloat(String(props.textStyle.fontSize ?? 16)) *
      2 *
      MEASUREMENT_REPETITIONS,
  );

  const style = computed<CSSProperties>(() => ({
    ...props.textStyle,
    letterSpacing: '0px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    alignSelf: 'flex-start',
    opacity: 0,
  }));

  let disposed = false;

  let retryFrame: number | undefined;

  const observer = new UniResizeObserver((entries) => {
    if (disposed) {
      return;
    }

    const box = entries[0]?.borderBoxSize[0];

    if (box && box.blockSize > 0) {
      advance.value = box.inlineSize / MEASUREMENT_REPETITIONS;
    }
  });

  const seed = async (element: UniElement) => {
    if (disposed || advance.value !== undefined) {
      return;
    }

    const rect = await element.getBoundingClientRectAsync();

    if (disposed || advance.value !== undefined) {
      return;
    }

    if (rect && rect.height > 0) {
      advance.value = rect.width / MEASUREMENT_REPETITIONS;

      return;
    }

    retryFrame = requestAnimationFrame(() => {
      if (disposed || advance.value !== undefined) {
        return;
      }

      retryFrame = undefined;

      void seed(element);
    });
  };

  const observe = () => {
    if (disposed) {
      return;
    }

    const element = uni.getElementById(id);

    if (element) {
      observer.observe(element);

      void seed(element);
    } else {
      retryFrame = requestAnimationFrame(() => {
        if (disposed) {
          return;
        }

        retryFrame = undefined;

        observe();
      });
    }
  };

  void Promise.resolve().then(observe);

  onUnmounted(() => {
    disposed = true;

    observer.disconnect();

    if (retryFrame !== undefined) {
      cancelAnimationFrame(retryFrame);
    }
  });

  return { id, width, text, maximumWidth, style };
};
