import type { RsbuildPlugin } from '@rsbuild/core';

import { appearanceKey, appearanceQuery } from './consts';

// Apply the session preference before the first paint and hydration.
function initializeAppearance(key: string, query: string) {
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(key);
  } catch {
    // Storage may be disabled independently of the system preference.
  }
  const theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia(query).matches
        ? 'dark'
        : 'light';
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('rp-dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function sessionAppearance(): RsbuildPlugin {
  return {
    name: 'session-appearance',
    setup(api) {
      api.modifyHTML((html) =>
        html.replace(
          /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,
          (tag, opening: string, content: string, closing: string) =>
            content.includes('rspress-theme-appearance')
              ? `${opening}(${initializeAppearance.toString()})(${JSON.stringify(appearanceKey)}, ${JSON.stringify(appearanceQuery)});${closing}`
              : tag,
        ),
      );
    },
  };
}
