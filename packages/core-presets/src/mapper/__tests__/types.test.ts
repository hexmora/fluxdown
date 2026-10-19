import type { MapperConfigInputs, MapperPluginConfig } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import { expectTypeOf } from 'expect-type';

import type {
  ShadConfig,
  ShadInputs,
  ShadPluginConfig,
  SmoothConfig,
  SmoothInputs,
  SmoothPluginConfig,
} from '..';

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

test('preset mappers export config, inputs and public plugin config from the mapper entry', () => {
  expectTypeOf<SmoothPluginConfig>().toEqualTypeOf<MapperPluginConfig<SmoothConfig>>();

  expectTypeOf<ShadPluginConfig>().toEqualTypeOf<MapperPluginConfig<ShadConfig>>();

  expectTypeOf<SmoothInputs<string>['enabled']>().toEqualTypeOf<
    IReadableClosure<boolean | undefined> | undefined
  >();

  expectTypeOf<ShadInputs['length']>().toEqualTypeOf<
    IReadableClosure<number | undefined> | undefined
  >();
});

test('mapper and effect registries describe unwrapped public plugin config', () => {
  expectTypeOf<MapperConfigs['smooth']>().toEqualTypeOf<SmoothPluginConfig>();

  expectTypeOf<MapperConfigs['shad']>().toEqualTypeOf<ShadPluginConfig>();

  expectTypeOf<EffectConfigs['shad']>().toEqualTypeOf<ShadPluginConfig>();
});
