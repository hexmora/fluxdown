import type { IPluggable, PluginClass } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { first, isArray } from 'lodash-es';

import type { CachePlugin, PluginCacheEntry } from './type';

import { buildPluggables } from '..';
import { getSnapshot, isConfigEqual } from './utils';

/** Shares class plugins for the lifetime of their document's active builders. */
export class PluginCacheStore {
  private readonly classes = new Map<PluginClass<CachePlugin>, PluginCacheEntry[]>();

  private readonly instances = new Map<CachePlugin, PluginCacheEntry>();

  build<T extends CachePlugin>(): T[];

  build<T extends CachePlugin>(pluggable: IPluggable<T, unknown>): T;

  build<T extends CachePlugin>(
    first: IPluggable<T, unknown>,
    second: IPluggable<T, unknown>,
    ...rest: IPluggable<T, unknown>[]
  ): T[];

  build<T extends CachePlugin>(...pluggables: IPluggable<T, unknown>[]): T | T[];

  build<T extends CachePlugin>(...pluggables: IPluggable<T, unknown>[]): T | T[] {
    const instances: T[] = [];

    try {
      for (const pluggable of pluggables) {
        instances.push(this.acquire(pluggable));
      }
    } catch (error) {
      try {
        this.release(...instances);
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], 'Failed to build and release plugins.', {
          cause: cleanupError,
        });
      }

      throw error;
    }

    if (instances.length !== 1) {
      return instances;
    }

    const instance = first(instances);

    assert(instance, 'A single pluggable must produce one plugin instance.');

    return instance;
  }

  private acquire<T extends CachePlugin>(pluggable: IPluggable<T, unknown>): T {
    const tuple = isArray(pluggable);

    const Plugin = tuple ? pluggable[0] : pluggable;

    const config = tuple ? getSnapshot(pluggable[1]) : undefined;

    const entries = this.classes.get(Plugin);

    const existing = entries?.find((entry) => isConfigEqual(entry.config, config));

    if (existing) {
      existing.references += 1;

      return existing.instance as T;
    }

    const instance = buildPluggables(pluggable);

    const entry: PluginCacheEntry = { Plugin, config, instance, references: 1 };

    this.instances.set(instance, entry);

    if (entries) {
      entries.push(entry);
    } else {
      this.classes.set(Plugin, [entry]);
    }

    return instance;
  }

  release(...instances: CachePlugin[]): void {
    const errors: unknown[] = [];

    for (const instance of instances) {
      const entry = this.instances.get(instance);

      if (!entry || --entry.references > 0) {
        continue;
      }

      this.instances.delete(instance);

      const entries = this.classes.get(entry.Plugin);

      if (entries) {
        const index = entries.indexOf(entry);

        if (index !== -1) {
          entries.splice(index, 1);
        }

        if (!entries.length) {
          this.classes.delete(entry.Plugin);
        }
      }

      try {
        instance.destroy();
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length) {
      throw errors.length === 1
        ? first(errors)
        : new AggregateError(errors, 'Failed to release plugins.');
    }
  }
}
