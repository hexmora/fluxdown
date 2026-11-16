import type { MapperConfigInputs, MapperPluginConfig } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import { expectTypeOf } from 'expect-type';

import type { ScaleConfig, ScaleInputs, ScalePluginConfig } from '../scale';
import type { ShadConfig, ShadInputs, ShadPluginConfig } from '../shad';
import type {
  DeprecatedSmoothConfig,
  SmoothConfig,
  SmoothInputs,
  SmoothPluginConfig,
} from '../smooth';

interface ExampleConfig {
  count: number;

  label?: string;
}

test('mapper configuration derives required and optional closure inputs', () => {
  expectTypeOf<MapperConfigInputs<ExampleConfig>>().toEqualTypeOf<{
    count: IReadableClosure<number>;
    label?: IReadableClosure<string | undefined>;
  }>();

  expectTypeOf<MapperPluginConfig<ExampleConfig>>().toEqualTypeOf<{
    count: number | IReadableClosure<number>;
    label?: string | IReadableClosure<string | undefined>;
  }>();
});

test('mappers export config, inputs and public plugin config from individual plugin entries', () => {
  // Smooth also accepts its pre-rename option names for one release.
  expectTypeOf<SmoothPluginConfig>().toEqualTypeOf<
    MapperPluginConfig<SmoothConfig & DeprecatedSmoothConfig>
  >();

  expectTypeOf<ShadPluginConfig>().toEqualTypeOf<MapperPluginConfig<ShadConfig>>();

  expectTypeOf<ScalePluginConfig>().toEqualTypeOf<MapperPluginConfig<ScaleConfig>>();

  expectTypeOf<SmoothInputs<string>['enabled']>().toEqualTypeOf<
    IReadableClosure<boolean | undefined> | undefined
  >();

  expectTypeOf<ShadInputs['length']>().toEqualTypeOf<
    IReadableClosure<number | undefined> | undefined
  >();

  expectTypeOf<ScaleInputs['duration']>().toEqualTypeOf<
    IReadableClosure<number | undefined> | undefined
  >();
});

test('mapper and effect registries describe unwrapped public plugin config', () => {
  expectTypeOf<MapperConfigs['smooth']>().toEqualTypeOf<SmoothPluginConfig>();

  expectTypeOf<MapperConfigs['shad']>().toEqualTypeOf<ShadPluginConfig>();

  expectTypeOf<MapperConfigs['scale']>().toEqualTypeOf<ScalePluginConfig>();

  expectTypeOf<EffectConfigs['shad']>().toEqualTypeOf<ShadPluginConfig>();

  expectTypeOf<EffectConfigs['scale']>().toEqualTypeOf<ScalePluginConfig>();
});
