import { createRspeedy } from '@lynx-js/rspeedy';

import config from './rsbuild.config';

const app = await createRspeedy({
  cwd: process.cwd(),
  rspeedyConfig: { ...config, mode: 'production' },
});

await app.build();
