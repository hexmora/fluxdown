import { defineConfig } from '@rslib/core';

import { packageConfig } from '../../rslib.shared';

export default defineConfig(
  packageConfig({ entry: { index: './src/index.tsx' }, jsxImportSource: 'react' }),
);
