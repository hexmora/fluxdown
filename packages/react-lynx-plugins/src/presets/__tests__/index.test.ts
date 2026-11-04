import { expect, test } from '@rstest/core';

import { toPluginList } from '../../base';
import { PRESET_FULL_PLUGINS } from '../full';
import { PRESET_LITE_PLUGINS } from '../lite';

const keys = (items: typeof PRESET_FULL_PLUGINS) =>
  toPluginList(items, 'slots').map((slot) => (Array.isArray(slot) ? slot[0].key : slot.key));

test('full renders formulas as native SVG while lite preserves their source', () => {
  expect(keys(PRESET_FULL_PLUGINS)).toContain('slot-tex-mathjax');

  expect(keys(PRESET_LITE_PLUGINS)).toContain('slot-tex');

  expect(keys(PRESET_LITE_PLUGINS)).not.toContain('slot-tex-mathjax');
});
