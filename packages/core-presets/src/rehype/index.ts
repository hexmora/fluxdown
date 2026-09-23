import type { IRehypePlugin, PluginClass } from '@fluxdown/types';

import { RawParserRehypePlugin } from './raw-parser';
import { SanitizerRehypePlugin } from './sanitizer';

export * from './base';
export * from './raw-parser';
export * from './sanitizer';
export * from './hoist-footnote';

export const PRESET_REHYPE_PLUGINS: PluginClass<IRehypePlugin>[] = [
  RawParserRehypePlugin,
  SanitizerRehypePlugin,
];
