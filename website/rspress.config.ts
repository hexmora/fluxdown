import { pluginLess } from '@rsbuild/plugin-less';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig, normalizeHref } from '@rspress/core';
import { fileURLToPath } from 'node:url';

import { reactNativeWebPlugin } from '../scripts/build/react-native-web';
import { sessionAppearance } from './theme/appearance/plugin';
import { sessionLocale } from './theme/locale/plugin';

export default defineConfig({
  root: 'docs',
  base: '/fluxdown/',
  siteOrigin: 'https://hexmora.github.io',
  title: 'Fluxdown',
  description:
    'Markdown that keeps up. Smooth streaming, resilient syntax, and a framework-free core.',
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'Fluxdown',
      description:
        'Markdown that keeps up. Smooth streaming, resilient syntax, and a framework-free core.',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: 'Fluxdown',
      description: '让 Markdown 自然流动。平滑输出，补全语法，以框架无关的核心适应你的产品。',
    },
  ],
  icon: '/logo.svg',
  logo: '/logo.svg',
  // Publish real HTML URLs so direct visits work without server rewrites.
  route: { cleanUrls: false, localeRedirect: 'never' },
  plugins: [
    {
      name: 'static-search-links',
      modifySearchIndexData(pages) {
        // Rspress 2 emits extensionless search targets even with cleanUrls disabled.
        for (const page of pages) {
          // Directory URLs already resolve to index.html and identify page metadata.
          if (!page.routePath.endsWith('/')) {
            page.routePath = normalizeHref(page.routePath, false);
          }
        }
      },
    },
  ],
  markdown: {
    defaultWrapCode: true,
    link: { checkDeadLinks: true, checkAnchors: true },
  },
  themeConfig: {
    darkMode: 'auto',
    editLink: {
      docRepoBaseUrl: 'https://github.com/hexmora/fluxdown/tree/main/website/docs',
    },
    socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/hexmora/fluxdown' }],
  },
  builderConfig: {
    plugins: [
      pluginLess(),
      pluginSass(),
      pluginSvgr(),
      sessionAppearance(),
      sessionLocale('/fluxdown/'),
      reactNativeWebPlugin(fileURLToPath(new URL('.', import.meta.url))),
    ],
    resolve: {
      alias: {
        // Workspace demos share the same React instance as the documentation theme.
        react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
        'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
        '@prefix': fileURLToPath(
          new URL('../packages/react-plugins/src/styles/_prefix.scss', import.meta.url),
        ),
      },
    },
    tools: {
      swc: {
        jsc: {
          transform: {
            useDefineForClassFields: true,
            // Stative's JSX runtime exposes jsx/jsxs, not the React-only jsxDEV.
            react: { development: false },
          },
        },
      },
    },
  },
});
