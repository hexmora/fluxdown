import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { defineConfig } from '@rslib/core';

export function vueLynxPackageConfig() {
  return defineConfig({
    format: 'esm',
    bundle: false,
    outBase: './src',
    dts: true,
    source: {
      tsconfigPath: './tsconfig.build.json',
      entry: {
        index: ['src/**', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/**/*.stories.*'],
      },
    },
    output: {
      target: 'web',
      // The app compiler extracts main-thread worklets from the published modules.
      minify: false,
      distPath: './dist/esm',
      copy: [{ from: '**/*.d.ts', context: './src', noErrorOnMissing: true }],
    },
    plugins: [pluginBabel(), pluginVueJsx(), pluginSass()],
    tools: {
      swc: { jsc: { transform: { useDefineForClassFields: true } } },
    },
  });
}
