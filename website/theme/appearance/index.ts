import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { appearanceKey, appearanceQuery } from './consts';

type Appearance = 'light' | 'dark';

function applyAppearance(theme: Appearance) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('rp-dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function useThemeState() {
  const [theme, setState] = useState<Appearance>('light');
  const preference = useRef<Appearance | null>(null);

  useLayoutEffect(() => {
    try {
      const stored = sessionStorage.getItem(appearanceKey);
      preference.current = stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      // The system preference still works when browser storage is unavailable.
    }
    const media = window.matchMedia(appearanceQuery);
    const sync = () => {
      const next = preference.current ?? (media.matches ? 'dark' : 'light');
      applyAppearance(next);
      setState(next);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const setTheme = useCallback((next: Appearance) => {
    preference.current = next;
    try {
      sessionStorage.setItem(appearanceKey, next);
    } catch {
      // Keep a manual choice for this page even if it cannot survive a reload.
    }
    applyAppearance(next);
    setState(next);
  }, []);

  return [theme, setTheme] as const;
}
