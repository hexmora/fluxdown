import { useEffect, useRef, useState } from 'react';

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

export const useReducedMotion = () => {
  // Wait for the client preference before choosing static content or autoplay.
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return reducedMotion;
};

export const useSourcePanel = () => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const collapse = () => {
      if (media.matches) {
        setExpanded(false);
      }
    };
    collapse();
    media.addEventListener('change', collapse);

    return () => media.removeEventListener('change', collapse);
  }, []);

  return {
    expanded,
    toggleExpanded: () => setExpanded((current) => !current),
  };
};
