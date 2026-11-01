import linkerPlugin from '@angular/compiler-cli/linker/babel';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig, normalizeHref } from '@rspress/core';
import { fileURLToPath } from 'node:url';

import { reactNativeWebPlugin } from '../scripts/build/react-native-web';
import { taroWebAliases, taroWebDefines } from '../scripts/build/taro-web';
import { lynxDemo } from './lynx/plugin';
import { seo } from './seo/plugin';
import { sessionAppearance } from './theme/appearance/plugin';
import { sessionLocale } from './theme/locale/plugin';

export default defineConfig({
  root: 'docs',
  base: '/fluxdown/',
  siteOrigin: 'https://hexmora.github.io',
  title: 'Fluxdown',
  description:
    'Streaming Markdown for AI apps across web, native apps, and mini programs, with smooth output, syntax repair, and a shared reactive core.',
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'Fluxdown',
      description:
        'Streaming Markdown for AI apps across web, native apps, and mini programs, with smooth output, syntax repair, and a shared reactive core.',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: 'Fluxdown',
      description:
        '面向 AI 应用的流式 Markdown 渲染库，覆盖 Web、原生应用和小程序。通过共享的响应式 Core，实现平滑输出、语法修复和自定义渲染。',
    },
  ],
  icon: '/logo.svg',
  logo: '/logo.svg',
  // Publish real HTML URLs so direct visits work without server rewrites.
  route: { cleanUrls: false, localeRedirect: 'never' },
  plugins: [
    seo(),
    lynxDemo(),
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
    shiki: {
      transformers: [
        {
          name: 'markdown-syntax-colors',
          preprocess(_code, options) {
            if (
              !['markdown', 'md'].includes(options.lang) ||
              !('theme' in options) ||
              typeof options.theme !== 'object'
            ) {
              return;
            }

            // Keep the default palette, adding colors for Markdown headings and list markers.
            options.theme = {
              ...options.theme,
              name: 'markdown-css-variables',
              tokenColors: [
                ...(options.theme.tokenColors ?? []),
                {
                  scope: 'markup.heading.markdown',
                  settings: { foreground: 'var(--shiki-token-keyword)', fontStyle: 'bold' },
                },
                {
                  scope: 'punctuation.definition.list.begin.markdown',
                  settings: { foreground: 'var(--shiki-token-constant)' },
                },
              ],
            };
          },
        },
      ],
    },
  },
  themeConfig: {
    darkMode: 'auto',
    editLink: {
      docRepoBaseUrl: 'https://github.com/hexmora/fluxdown/tree/main/website/docs',
    },
    socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/hexmora/fluxdown' }],
  },
  builderConfig: {
    source: { define: taroWebDefines },
    plugins: [
      pluginLess(),
      pluginSass(),
      pluginSvgr(),
      pluginSvelte({ preprocessOptions: { typescript: false } }),
      sessionAppearance(),
      sessionLocale('/fluxdown/'),
      reactNativeWebPlugin(fileURLToPath(new URL('.', import.meta.url))),
    ],
    resolve: {
      aliasStrategy: 'prefer-alias',
      alias: {
        ...taroWebAliases(),
        '@fluxdown/angular': fileURLToPath(new URL('../packages/angular/dist', import.meta.url)),
        '@fluxdown/angular-plugins': fileURLToPath(
          new URL('../packages/angular-plugins/dist', import.meta.url),
        ),
        // Workspace demos share the same React instance as the documentation theme.
        react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
        'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
        // Directory aliases bypass Solid's browser export conditions.
        'solid-js$': fileURLToPath(
          new URL('./node_modules/solid-js/dist/solid.js', import.meta.url),
        ),
        'solid-js/web$': fileURLToPath(
          new URL('./node_modules/solid-js/web/dist/web.js', import.meta.url),
        ),
        'solid-js/store$': fileURLToPath(
          new URL('./node_modules/solid-js/store/dist/store.js', import.meta.url),
        ),
        vue: fileURLToPath(new URL('./node_modules/vue', import.meta.url)),
        '@fluxdown/solid$': fileURLToPath(
          new URL('../packages/solid/dist/esm/full.browser.js', import.meta.url),
        ),
        '@fluxdown/solid-plugins/base$': fileURLToPath(
          new URL('../packages/solid-plugins/dist/esm/base.browser.js', import.meta.url),
        ),
        '@fluxdown/solid-plugins/full$': fileURLToPath(
          new URL('../packages/solid-plugins/dist/esm/presets/full.browser.js', import.meta.url),
        ),
        '@fluxdown/solid-plugins/lite$': fileURLToPath(
          new URL('../packages/solid-plugins/dist/esm/presets/lite.browser.js', import.meta.url),
        ),
        // Vue JSX is compiled by its package build before Rspress handles the demo.
        '@fluxdown/vue$': fileURLToPath(
          new URL('../packages/vue/dist/esm/full.browser.js', import.meta.url),
        ),
        '@fluxdown/vue/full$': fileURLToPath(
          new URL('../packages/vue/dist/esm/full.browser.js', import.meta.url),
        ),
        '@fluxdown/vue/lite$': fileURLToPath(
          new URL('../packages/vue/dist/esm/lite.browser.js', import.meta.url),
        ),
        '@fluxdown/vue/raw$': fileURLToPath(
          new URL('../packages/vue/dist/esm/raw.browser.js', import.meta.url),
        ),
        '@fluxdown/vue-plugins/base$': fileURLToPath(
          new URL('../packages/vue-plugins/dist/esm/base.browser.js', import.meta.url),
        ),
        '@fluxdown/vue-plugins/full$': fileURLToPath(
          new URL('../packages/vue-plugins/dist/esm/presets/full.browser.js', import.meta.url),
        ),
        '@fluxdown/vue-plugins/lite$': fileURLToPath(
          new URL('../packages/vue-plugins/dist/esm/presets/lite.browser.js', import.meta.url),
        ),
        '@prefix': fileURLToPath(
          new URL('../packages/react-plugins/src/styles/_prefix.scss', import.meta.url),
        ),
      },
    },
    tools: {
      rspack: {
        module: {
          rules: [
            {
              // Link the Angular Package Format before bundling the browser preview.
              test: /\.m?js$/,
              include: [
                /[/\\]@angular[/\\]/,
                /[/\\]packages[/\\]angular(?:-plugins)?[/\\]dist[/\\]/,
              ],
              loader: 'babel-loader',
              options: {
                plugins: [linkerPlugin],
                compact: false,
                cacheDirectory: true,
              },
            },
            {
              // Taro's Stencil fallback carries a redundant webpackExports hint.
              // Keep its pure annotations while Rspack infers the dynamic import.
              test: /@tarojs[/\\]components[/\\]dist[/\\]components[/\\]taro-video-core\.js$/,
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  target: 'esnext',
                  minify: { format: { comments: 'some', preserveAnnotations: true } },
                },
              },
            },
          ],
        },
      },
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
