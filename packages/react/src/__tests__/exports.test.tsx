import type { ComponentProps } from 'react';

import { PRESET_RENDER_PLUGINS, ShadRenderPlugin } from '@fluxdown/react-presets/render';
import { expectTypeOf } from 'expect-type';
import { keys, sortBy } from 'lodash-es';

import type { BaseBuildConfig, StreamingConfig } from '..';
import type { FluxdownProps } from '../types';

import * as ReactEntry from '..';

describe('package exports', () => {
  test('exports Fluxdown', () => {
    expect(sortBy(keys(ReactEntry))).toEqual(['Fluxdown']);
  });

  test('exports Shad rendering from the render preset package', () => {
    expect(PRESET_RENDER_PLUGINS).toContain(ShadRenderPlugin);
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

    expectTypeOf<'smooth' extends keyof PublicProps ? true : false>().toEqualTypeOf<false>();

    expectTypeOf<'shad' extends keyof PublicProps ? true : false>().toEqualTypeOf<false>();

    expectTypeOf<'config' extends keyof PublicProps ? true : false>().toEqualTypeOf<false>();
  });
});
