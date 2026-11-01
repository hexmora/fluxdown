import { getTime } from '@fluxdown/utils';
import { onMounted, onScopeDispose, shallowRef, watch } from 'vue';

import { EASE_IN_OUT } from './easing';

export const useAppear = (source: () => { start: number; duration: number }) => {
  const progress = shallowRef(1);

  watch(
    source,
    ({ start, duration }, _, onCleanup) => {
      let frame = 0;

      const tick = () => {
        const value =
          start < 0 || duration <= 0 ? 1 : Math.min(1, Math.max(0, (getTime() - start) / duration));

        progress.value = value;

        if (value < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      tick();

      onCleanup(() => cancelAnimationFrame(frame));
    },
    { immediate: true, flush: 'sync' },
  );

  return progress;
};

export const useBreathe = () => {
  const opacity = shallowRef(1);

  let frame = 0;

  onMounted(() => {
    const start = getTime();

    const tick = () => {
      const phase = ((getTime() - start) % 1000) / 1000;

      opacity.value =
        phase < 1 / 3
          ? 1
          : phase < 0.5
            ? 1 - EASE_IN_OUT((phase - 1 / 3) * 6)
            : phase < 5 / 6
              ? 0
              : EASE_IN_OUT((phase - 5 / 6) * 6);

      frame = requestAnimationFrame(tick);
    };

    tick();
  });

  onScopeDispose(() => cancelAnimationFrame(frame));

  return opacity;
};
