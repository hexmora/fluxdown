import type { RsbuildPlugin } from '@rsbuild/core';

import { localeKey } from './consts';

function initializeLocale(key: string, base: string) {
  if (/bot|spider|crawl|lighthouse/i.test(window.navigator.userAgent)) return;

  const { pathname, search, hash } = window.location;

  const path = pathname.slice(base.length);

  // A documentation link keeps its language; only the home page chooses a default.
  if (!['', '/', '/index.html', '/zh/', '/zh/index.html'].includes(path)) return;

  let stored: string | null = null;

  try {
    stored = sessionStorage.getItem(key);
  } catch {
    // The browser preference still works when storage is unavailable.
  }

  const preferred = window.navigator.languages
    .map((language) => language.toLowerCase().split('-')[0])
    .find((language) => language === 'en' || language === 'zh');

  const language = stored === 'en' || stored === 'zh' ? stored : (preferred ?? 'en');

  const current = path.startsWith('/zh/') ? 'zh' : 'en';

  if (language === current) return;

  window.location.replace(`${base}${language === 'zh' ? '/zh/' : '/'}${search}${hash}`);
}

export function sessionLocale(base: string): RsbuildPlugin {
  return {
    name: 'session-locale',
    setup(api) {
      api.modifyHTML((html) =>
        html.replace(
          '</head>',
          `<script>(${initializeLocale.toString()})(${JSON.stringify(localeKey)}, ${JSON.stringify(base.replace(/\/$/, ''))});</script></head>`,
        ),
      );
    },
  };
}
