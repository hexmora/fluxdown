import { fileURLToPath } from 'node:url';

import { uniPackageConfig } from '../../scripts/build/uni-app';

export default uniPackageConfig(fileURLToPath(new URL('.', import.meta.url)));
