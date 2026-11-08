import { useEffect, useLayoutEffect, useRef } from 'react';

import type { BottomScrollMode } from './utils';

import { createBottomScroll } from './utils';

export const useBottomScroll = <Viewport extends HTMLElement = HTMLElement>(
  reducedMotion: boolean | null,
  mode: BottomScrollMode,
  previewKey?: string,
  onWrite?: (viewport: Viewport) => void,
) => {
  const viewportRef = useRef<Viewport>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const onWriteRef = useRef(onWrite);

  useLayoutEffect(() => {
    modeRef.current = mode;
    onWriteRef.current = onWrite;
  }, [mode, onWrite]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (reducedMotion === null || !viewport || !contentRef.current) {
      return;
    }

    return createBottomScroll(
      viewport,
      contentRef.current,
      reducedMotion,
      () => modeRef.current,
      () => onWriteRef.current?.(viewport),
    );
  }, [reducedMotion, previewKey]);

  return { viewportRef, contentRef };
};

export { createBottomScroll } from './utils';
export type { BottomScrollMode } from './utils';
