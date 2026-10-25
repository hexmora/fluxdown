import type { ComponentProps } from 'react';

import { EffectShadRenderPlugin } from '@fluxdown/react-base-plugins/plugins/effect-shad';
import { PRESET_FULL_PLUGINS } from '@fluxdown/react-plugins/full';
import { expectTypeOf } from 'expect-type';
import * as ReactEntry from 'fluxdown';
import * as FullEntry from 'fluxdown/full';
import * as LiteEntry from 'fluxdown/lite';
import * as RawEntry from 'fluxdown/raw';
import { keys, sortBy } from 'lodash-es';

import type { BaseBuildConfig, EffectItem, StreamingConfig } from '../packs/full';
import type { FluxdownProps, PluginConfigs } from '../packs/full';
import type { FluxdownLiteProps } from '../packs/lite';
import type { FluxdownRawProps } from '../packs/raw';

describe('package exports', () => {
  test('exports Fluxdown', () => {
    expect(sortBy(keys(ReactEntry))).toEqual(['Fluxdown']);
  });

  test('resolves the full, lite, and raw subpath entries', () => {
    expect(FullEntry.Fluxdown).toBe(ReactEntry.Fluxdown);
    expect(sortBy(keys(LiteEntry))).toEqual(['FluxdownLite']);
    expect(sortBy(keys(RawEntry))).toEqual(['FluxdownRaw', 'isPropsEqual']);
  });

  test('includes Shad rendering in the full preset', () => {
    expect(PRESET_FULL_PLUGINS.flatMap((item) => item.renders ?? [])).toContain(
      EffectShadRenderPlugin,
    );
  });

  test('requires plugins only on the raw component', () => {
    type RawProps = ComponentProps<typeof RawEntry.FluxdownRaw>;
    type LiteProps = ComponentProps<typeof LiteEntry.FluxdownLite>;

    expectTypeOf<RawProps>().toMatchTypeOf<FluxdownRawProps>();
    expectTypeOf<LiteProps>().toMatchTypeOf<FluxdownLiteProps>();
    expectTypeOf<{ text: string }>().not.toMatchTypeOf<RawProps>();
    expectTypeOf<{ text: string }>().toMatchTypeOf<LiteProps>();
    expectTypeOf<{ text: string }>().toMatchTypeOf<ComponentProps<typeof ReactEntry.Fluxdown>>();
  });

  test('exposes Fluxdown with its public prop contract', () => {
    type RootExport = keyof typeof ReactEntry;
    type PublicProps = ComponentProps<typeof ReactEntry.Fluxdown>;

    expectTypeOf<RootExport>().toEqualTypeOf<'Fluxdown'>();
    expectTypeOf<PublicProps>().toMatchTypeOf<FluxdownProps>();
    expectTypeOf<FluxdownProps>().toMatchTypeOf<PublicProps>();

    expectTypeOf<'build' extends keyof PublicProps ? true : false>().toEqualTypeOf<true>();

    expectTypeOf<PublicProps['build']>().toEqualTypeOf<BaseBuildConfig | undefined>();

    expectTypeOf<PublicProps['streaming']>().toEqualTypeOf<boolean | StreamingConfig | undefined>();

    expectTypeOf<StreamingConfig['effect']>().toEqualTypeOf<
      boolean | EffectItem | EffectItem[] | undefined
    >();

    expectTypeOf<'shad' extends keyof StreamingConfig ? true : false>().toEqualTypeOf<false>();

    expectTypeOf<'smooth' extends keyof PublicProps ? true : false>().toEqualTypeOf<false>();

    expectTypeOf<'shad' extends keyof PublicProps ? true : false>().toEqualTypeOf<false>();

    expectTypeOf<'config' extends keyof PublicProps ? true : false>().toEqualTypeOf<false>();
  });

  test('keeps registries required while public plugin configuration remains optional', () => {
    type OptionalKeys<T> = {
      [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
    }[keyof T];

    type OptionalRegistryKeys =
      | OptionalKeys<MapperConfigs>
      | OptionalKeys<EffectConfigs>
      | OptionalKeys<RemarkConfigs>
      | OptionalKeys<RehypeConfigs>
      | OptionalKeys<RepairConfigs>
      | OptionalKeys<RenderConfigs>
      | OptionalKeys<SlotConfigs>;

    expectTypeOf<OptionalRegistryKeys>().toEqualTypeOf<never>();
    expectTypeOf<{}>().toMatchTypeOf<PluginConfigs>();

    const config: PluginConfigs = {
      scale: { duration: 250 },
      'render-scale': { disabled: true },
      'slot-paragraph': { disabled: true },
    };

    expect(config.scale?.duration).toBe(250);
  });
});
