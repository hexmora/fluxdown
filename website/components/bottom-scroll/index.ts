import { useEffect, useLayoutEffect, useRef } from 'react';

import type { BottomScrollMode } from './utils';

import { createBottomScroll } from './utils';

export const useBottomScroll = (
  reducedMotion: boolean | null,
  mode: BottomScrollMode,
  previewKey?: string,
) => {
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);

  useLayoutEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (reducedMotion === null || !viewportRef.current || !contentRef.current) {
      return;
    }

    return createBottomScroll(
      viewportRef.current,
      contentRef.current,
      reducedMotion,
      () => modeRef.current,
    );
  }, [reducedMotion, previewKey]);

  return { viewportRef, contentRef };
};

export { createBottomScroll } from './utils';
export type { BottomScrollMode } from './utils';
