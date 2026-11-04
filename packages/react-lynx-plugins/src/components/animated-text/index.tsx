import type { ComponentProps } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

import { useCallback, useMainThreadRef, useState } from '@lynx-js/react';

import { useTextStyle } from '../../base/theme';
import { TextLayoutWidthProvider, useTextAnimation, useTextLayoutWidth } from '../../context';

type AnimatedTextProps = ComponentProps<'text'> & {
  /** Leaf glyphs can inherit the surrounding text width without reporting their own layout. */
  measureLayout?: boolean;
};

/** Native inline text cannot animate opacity; animate each resolved foreground instead. */
export const AnimatedText = ({
  children,
  style,
  bindlayoutchange,
  measureLayout = true,
  ...props
}: AnimatedTextProps) => {
  const animation = useTextAnimation();

  const parentWidth = useTextLayoutWidth();

  const [layoutWidth, setLayoutWidth] = useState<number>();

  const onLayoutChange = useCallback<NonNullable<ComponentProps<'text'>['bindlayoutchange']>>(
    (event) => {
      const width = event.detail.width;

      setLayoutWidth(
        typeof width === 'number' && Number.isFinite(width) && width > 0 ? width : undefined,
      );

      bindlayoutchange?.(event);
    },
    [bindlayoutchange],
  );

  const inherited = useTextStyle();

  const color = typeof style === 'object' ? (style.color ?? inherited.color) : inherited.color;

  const native = animation && 'arrival' in animation ? animation : null;

  const arrival = native?.arrival ?? -1;

  const duration = native?.duration ?? 0;

  const handle = useMainThreadRef<MainThread.Animation | null>(null);

  const ref = useCallback(
    (element: MainThread.Element | null) => {
      'main thread';

      handle.current?.cancel();
      handle.current = null;

      if (!element || arrival < 0 || duration <= 0 || !color) return;

      try {
        const styled = element as MainThread.Element & {
          getComputedStyleProperty?: (property: string) => string;
        };

        if (styled.getComputedStyleProperty?.('animation-play-state') === 'paused') return;
      } catch {
        // Older animation-capable hosts may not expose computed style queries.
      }

      const delay = Math.min(0, arrival - Date.now());

      if (delay <= -duration) return;

      handle.current = element.animate([{ color: 'transparent' }, { color: String(color) }], {
        duration,
        delay,
        easing: 'cubic-bezier(0, 0, 0.58, 1)',
        fill: 'both',
      });
    },
    [arrival, color, duration],
  );

  return (
    <TextLayoutWidthProvider value={measureLayout ? (layoutWidth ?? parentWidth) : parentWidth}>
      <text
        text-fake-bold={true}
        {...props}
        bindlayoutchange={measureLayout ? onLayoutChange : bindlayoutchange}
        main-thread:ref={native ? ref : undefined}
        style={style}
      >
        {children}
      </text>
    </TextLayoutWidthProvider>
  );
};
