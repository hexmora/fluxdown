import type { MainThread } from '@lynx-js/types';

import { getTime } from '@fluxdown/utils';
import { computed, onScopeDispose, watch } from 'vue';
import { nextTick, runOnMainThread, useMainThreadRef } from 'vue-lynx';

const APPEAR_STEPS = [
  [0, 1],
  [0.073441, 0.987688],
  [0.238144, 0.951057],
  [0.431649, 0.891007],
  [0.614656, 0.809017],
  [0.765625, 0.707107],
  [0.876096, 0.587785],
  [0.946729, 0.45399],
  [0.984064, 0.309017],
  [0.998001, 0.156434],
  [1, 0],
] as const;

export const getAppearKeyframes = (blur: number, fontSize: string | number = '16px') => {
  const size = String(fontSize);

  const pixels = /^\d+(?:\.\d+)?(?:px)?$/.test(size);

  const radius = pixels ? blur * parseFloat(size) : blur;

  const unit = pixels ? 'px' : 'em';

  return APPEAR_STEPS.map(([opacity, factor], index) => ({
    offset: index / 10,
    opacity,
    filter: `blur(${Number((radius * factor).toFixed(6))}${unit})`,
  }));
};

export const useScaleAnimation = (
  source: () => {
    keyframes: Record<string, number | string>[];

    start: number;

    duration: number;

    easing: string;
  },
) => {
  const element = useMainThreadRef<MainThread.Element | null>(null);

  const animation = useMainThreadRef<MainThread.Animation | null>(null);

  const config = computed(source);

  const start = computed(() => config.value.start);

  // Both runtimes share wall time; performance.now() can have a different origin.
  const arrival = computed(() => (start.value < 0 ? -1 : Date.now() + start.value - getTime()));

  let disposed = false;

  let active = false;

  onScopeDispose(() => {
    disposed = true;

    if (!active) return;

    void runOnMainThread(() => {
      'main thread';

      if (!animation) return;

      animation.current?.cancel();

      animation.current = null;
    })();
  });

  watch(
    config,
    async ({ keyframes, duration, easing }, _, onCleanup) => {
      if (!active && (start.value < 0 || duration <= 0)) return;

      let stale = false;

      onCleanup(() => {
        stale = true;
      });

      const timestamp = arrival.value;

      await nextTick();

      if (disposed || stale) return;

      active = true;

      void runOnMainThread(() => {
        'main thread';

        if (!animation) return;

        animation.current?.cancel();

        animation.current = null;

        const target = element?.current;

        if (!target || timestamp < 0 || duration <= 0) return;

        try {
          const styled = target as MainThread.Element & {
            getComputedStyleProperty?: (property: string) => string;
          };

          if (styled.getComputedStyleProperty?.('animation-play-state') === 'paused') return;
        } catch {
          // getComputedStyleProperty was added after the native animation API.
        }

        const delay = Math.min(0, timestamp - Date.now());

        if (delay <= -duration) return;

        animation.current = target.animate(keyframes, { duration, delay, easing, fill: 'both' });
      })();
    },
    { immediate: true, flush: 'post' },
  );

  return element;
};
