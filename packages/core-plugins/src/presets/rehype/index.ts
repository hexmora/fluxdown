import type { IRehypePlugin, PluginClass } from '@fluxdown/types';

import { RawParserRehypePlugin } from '../../plugins/rehype/raw-parser';
import { SanitizerRehypePlugin } from '../../plugins/rehype/sanitizer';

export const PRESET_REHYPE_PLUGINS: PluginClass<IRehypePlugin>[] = [
  RawParserRehypePlugin,
  SanitizerRehypePlugin,
];
