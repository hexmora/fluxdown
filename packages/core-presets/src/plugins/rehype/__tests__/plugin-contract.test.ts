import { PluginPriority } from '@fluxdown/types';
import { uniq } from 'lodash-es';

import { PRESET_REHYPE_PLUGINS } from '../../../presets/rehype';
import { HoistFootnoteRehypePlugin } from '../hoist-footnote';
import { RawParserRehypePlugin } from '../raw-parser';
import { SanitizerRehypePlugin } from '../sanitizer';

describe('rehype plugin contracts', () => {
  test('exposes unique stable keys for all built-in plugins', () => {
    const keys = PRESET_REHYPE_PLUGINS.map((PluginClass) => PluginClass.key);

    expect(keys).toEqual(['rehype-raw-parser', 'rehype-sanitizer']);
    expect(uniq(keys)).toHaveLength(keys.length);
  });

  test('runs all built-in rehype plugins in the final priority bucket', () => {
    expect(new RawParserRehypePlugin().config.priority).toBe(PluginPriority.Lowest);
    expect(new SanitizerRehypePlugin().config.priority).toBe(PluginPriority.Lowest);
    expect(new HoistFootnoteRehypePlugin().config.priority).toBe(PluginPriority.Lowest);
  });
});
