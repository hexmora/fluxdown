import type { MainThread } from '@lynx-js/types';

import { getTime } from '@fluxdown/utils';
import { useCallback, useMainThreadRef, useMemo } from '@lynx-js/react';

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
  keyframes: Record<string, number | string>[],
  start: number,
  duration: number,
  easing: string,
) => {
  const animation = useMainThreadRef<MainThread.Animation | null>(null);

  // Both runtimes share wall time; performance.now() can have a different origin.
  const arrival = useMemo(() => (start < 0 ? -1 : Date.now() + start - getTime()), [start]);

  return useCallback(
    (element: MainThread.Element | null) => {
      'main thread';

      animation.current?.cancel();
      animation.current = null;

      if (!element || arrival < 0 || duration <= 0) return;

      // The CSS media query supplies the same signal on every host. Older
      // engines may not expose computed styles, and retain the default motion.
      try {
        const styled = element as MainThread.Element & {
          getComputedStyleProperty?: (property: string) => string;
        };

        if (styled.getComputedStyleProperty?.('animation-play-state') === 'paused') return;
      } catch {
        // getComputedStyleProperty was added after the native animation API.
      }

      const delay = Math.min(0, arrival - Date.now());

      if (delay <= -duration) return;

      // Native keyframes do not resolve var()/calc() inside transform or filter.
      animation.current = element.animate(keyframes, { duration, delay, easing, fill: 'both' });
    },
    [arrival, duration, easing, keyframes],
  );
};
