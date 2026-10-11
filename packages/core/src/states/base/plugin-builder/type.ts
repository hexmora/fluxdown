import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import type { MapperPluggable } from '../mapper-composer';
import type { PluginCacheStore } from './exports';

export type AnyPluggable = IPluggable<IPluginWithConfig, unknown> | MapperPluggable;

export type PluggableOf<T extends AnyPluggable> =
  T extends IPluggable<infer P, unknown> ? IPluggable<P, unknown> : MapperPluggable;

export interface PluginBuilderInputs<T extends IPluginWithConfig> {
  plugins: IPluggable<T, unknown>[];

  sort?: boolean;

  cacheStore?: PluginCacheStore;
}
