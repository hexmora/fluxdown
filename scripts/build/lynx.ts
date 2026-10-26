import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export function lynxPackageConfig() {
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
      // JSX references must remain intact until the app's ReactLynx compiler
      // lowers them. Rslib's unused-code pass does not track preserved JSX.
      minify: false,
      distPath: './dist/esm',
      filename: { js: '[name].jsx' },
      copy: [{ from: '**/*.d.ts', context: './src', noErrorOnMissing: true }],
    },
    // The consuming app compiles JSX for both Lynx threads. A generic React
    // transform here would erase the element information that compiler needs.
    plugins: [pluginReact({ swcReactOptions: { runtime: 'preserve' } })],
    tools: {
      swc: { jsc: { transform: { useDefineForClassFields: true } } },
    },
  });
}
