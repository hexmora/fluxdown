import { Chunk } from '@fluxdown/core-plugins/plugins/mapper/chunk';
import { Shad } from '@fluxdown/core-plugins/plugins/mapper/shad';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { expect, test } from 'vitest';

import { toEffectMappers, toEffects } from '../effect';

test('distinguishes one configured effect from an ordered list', () => {
  expect(toEffects(false)).toEqual([]);

  expect(toEffects(true)).toEqual(['scale']);

  expect(toEffects('shad')).toEqual(['shad']);

  expect(toEffects(['shad', { length: 3 }])).toEqual([['shad', { length: 3 }]]);

  expect(toEffects(['shad', 'suffix'])).toEqual(['shad', 'suffix']);

  expect(toEffects([[Chunk, { duration: 300 }], 'suffix'])).toEqual([
    [Chunk, { duration: 300 }],
    'suffix',
  ]);
});

test('enables named effects without mutating options or replacing custom mapper tuples', () => {
  const options = { length: 3 };

  const mapper = [Chunk, { duration: 300 }] as const;

  expect(toEffectMappers([['shad', options]], PRESET_MAPPER_PLUGINS)).toEqual([
    [Shad, { length: 3, enabled: true }],
  ]);

  expect(options).toEqual({ length: 3 });

  const custom = [mapper[0], mapper[1]] as [typeof Chunk, { duration: number }];

  expect(toEffectMappers([custom], PRESET_MAPPER_PLUGINS)[0]).toBe(custom);

  expect(toEffectMappers([['shad', { enabled: false }]], PRESET_MAPPER_PLUGINS)).toEqual([
    [Shad, { enabled: false }],
  ]);
});

test('rejects unavailable named effects', () => {
  expect(() => toEffectMappers(['shad'], [])).toThrow('Unknown effect: shad');
});
