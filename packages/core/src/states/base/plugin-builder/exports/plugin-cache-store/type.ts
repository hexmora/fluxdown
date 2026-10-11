import type { IPluginWithConfig, PluginClass } from '@fluxdown/types';
import type { IDestructible } from 'stative';

export type CachePlugin = IPluginWithConfig & IDestructible;

export type PluginConfigSnapshot =
  | { kind: 'value'; value: unknown }
  | { kind: 'record' | 'array'; value: object; properties: Map<PropertyKey, PluginConfigSnapshot> }
  | {
      kind: 'comparable';
      value: object;
      prototype: object | null;
      compare: (other: unknown) => boolean;
    };

export interface PluginCacheEntry {
  Plugin: PluginClass<CachePlugin>;

  config?: PluginConfigSnapshot;

  instance: CachePlugin;

  references: number;
}
