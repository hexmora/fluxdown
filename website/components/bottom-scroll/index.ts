import { useEffect, useRef } from 'react';

import { createBottomScroll } from './utils';

export const useBottomScroll = (reducedMotion: boolean | null) => {
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion === null || !viewportRef.current || !contentRef.current) {
      return;
    }

    return createBottomScroll(viewportRef.current, contentRef.current, reducedMotion);
  }, [reducedMotion]);

  return { viewportRef, contentRef };
};

export { createBottomScroll } from './utils';
