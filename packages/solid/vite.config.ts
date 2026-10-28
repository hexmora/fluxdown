import { defineConfig } from 'vite';

import { solidPackageConfig } from '../../scripts/build/solid';

export default defineConfig(({ isSsrBuild }) =>
  solidPackageConfig(
    import.meta.dirname,
    {
      raw: './src/packs/raw/index.tsx',
      lite: './src/packs/lite/index.tsx',
      full: './src/packs/full/index.tsx',
    },
    !!isSsrBuild,
    ['@fluxdown/solid-plugins/styles.css'],
  ),
);
