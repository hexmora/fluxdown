import type { CSSProperties, MainThread } from '@lynx-js/types';

import { computed, onScopeDispose, watch } from 'vue';
import { nextTick, runOnMainThread, useMainThreadRef } from 'vue-lynx';

export const useTextAnimationRef = (
  source: () => {
    arrival: number;
    duration: number;
    easing: string;
    color: CSSProperties['color'];
  },
) => {
  const element = useMainThreadRef<MainThread.Element | null>(null);

  const handle = useMainThreadRef<MainThread.Animation | null>(null);

  const config = computed(source);

  let disposed = false;

  let active = false;

  onScopeDispose(() => {
    disposed = true;

    if (!active) return;

    void runOnMainThread(() => {
      'main thread';

      if (!handle) return;

      handle.current?.cancel();

      handle.current = null;
    })();
  });

  watch(
    config,
    async ({ arrival, duration, easing, color }, _, onCleanup) => {
      if (!active && (arrival < 0 || duration <= 0 || !color)) return;

      let stale = false;

      onCleanup(() => {
        stale = true;
      });

      await nextTick();

      if (disposed || stale) return;

      active = true;

      void runOnMainThread(() => {
        'main thread';

        if (!handle) return;

        handle.current?.cancel();

        handle.current = null;

        const target = element?.current;

        if (!target || arrival < 0 || duration <= 0 || !color) return;

        try {
          const styled = target as MainThread.Element & {
            getComputedStyleProperty?: (property: string) => string;
          };

          if (styled.getComputedStyleProperty?.('animation-play-state') === 'paused') return;
        } catch {
          // Older animation-capable hosts may not expose computed style queries.
        }

        const delay = Math.min(0, arrival - Date.now());

        if (delay <= -duration) return;

        handle.current = target.animate([{ color: 'transparent' }, { color: String(color) }], {
          duration,
          delay,
          easing,
          fill: 'both',
        });
      })();
    },
    { immediate: true, flush: 'post' },
  );

  return element;
};
