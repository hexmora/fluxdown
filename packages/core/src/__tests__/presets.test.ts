import type { IPluggable, IRemarkPlugin } from '@fluxdown/types';

import { Chunk } from '@fluxdown/core-presets/plugins/mapper/chunk';
import { Scale } from '@fluxdown/core-presets/plugins/mapper/scale';
import { Shad } from '@fluxdown/core-presets/plugins/mapper/shad';
import { Smooth } from '@fluxdown/core-presets/plugins/mapper/smooth';
import { Suffix } from '@fluxdown/core-presets/plugins/mapper/suffix';
import { SyntaxMathRemarkPlugin } from '@fluxdown/core-presets/plugins/remark/syntax-math';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-presets/presets/mapper';
import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-presets/presets/rehype';
import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-presets/presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-presets/presets/repair';

import { mergePluginPluggables } from '../states/base';

describe('core preset imports', () => {
  test('resolves plugins through their public plugin and preset entry points', () => {
    expect(typeof Smooth).toBe('function');

    expect(PRESET_MAPPER_PLUGINS).toEqual([Smooth, Shad, Scale, Chunk, Suffix]);

    expect(PRESET_REHYPE_PLUGINS.length).toBeGreaterThan(0);

    expect(PRESET_REMARK_PLUGINS).toContain(SyntaxMathRemarkPlugin);

    expect(PRESET_REPAIR_PLUGINS.length).toBeGreaterThan(0);
  });

  test('replaces an internal preset when the override comes from the public entry point', () => {
    const override: IPluggable<IRemarkPlugin, { repairEnding: boolean }> = [
      SyntaxMathRemarkPlugin,
      { repairEnding: true },
    ];

    const merged = mergePluginPluggables<IPluggable<IRemarkPlugin, unknown>>(
      PRESET_REMARK_PLUGINS,
      [override],
    );

    expect(merged.filter((item) => item === SyntaxMathRemarkPlugin)).toEqual([]);

    expect(merged).toContain(override);
  });
});
