import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';
import type { IDestructible } from 'stative';

import { cacheDiffMap } from '@fluxdown/utils';
import { useClearable, useCurrent } from 'stative';

import type { PluginBuilderInputs } from './type';

import {
  buildPluggables,
  isPluggableEnabled,
  isPluggableEqual,
  sortPluginInstances,
} from './exports';
import { isPrivatePluggableEqual } from './utils';

export * from './exports';
export * from './type';

export function PluginBuilder<T extends IPluginWithConfig & IDestructible>({
  plugins,
  sort = true,
  cacheStore,
}: PluginBuilderInputs<T>): T[] {
  const state = useCurrent(() => {
    const instances: T[] = [];

    const pluggables: IPluggable<T, unknown>[] = [];

    return {
      instances,
      pluggables,
      cacheStore,
      destroy() {
        const previous = this.instances;

        if (this.cacheStore) {
          this.instances = [];

          this.pluggables = [];

          this.cacheStore.release(...previous);

          return;
        }

        for (const instance of previous) {
          instance.destroy();
        }

        this.instances = [];

        this.pluggables = [];
      },
    };
  });

  useClearable(state);

  if (state.cacheStore !== cacheStore) {
    state.destroy();

    state.cacheStore = cacheStore;
  }

  const retired: T[] = [];

  const pluggables: IPluggable<T, unknown>[] = [];

  const isEqual = cacheStore ? isPrivatePluggableEqual : isPluggableEqual;

  try {
    state.instances = cacheDiffMap({
      prev: state.pluggables.map((pluggable, index) => [pluggable, state.instances[index]]),
      current: plugins.filter(isPluggableEnabled),
      mapper: (pluggable) => {
        const instance = cacheStore ? cacheStore.build(pluggable) : buildPluggables(pluggable);

        pluggables.push(pluggable);

        return instance;
      },
      comparer: (previous, current) => {
        if (!isEqual(previous, current)) {
          return false;
        }

        pluggables.push(previous);

        return true;
      },
      teardown: (instance) => {
        if (cacheStore) {
          retired.push(instance);
        } else {
          instance.destroy();
        }
      },
    });

    state.pluggables = pluggables;
  } catch (error) {
    try {
      cacheStore?.release(...retired);
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Failed to build and release plugins.', {
        cause: cleanupError,
      });
    }

    throw error;
  }

  cacheStore?.release(...retired);

  return sort ? sortPluginInstances(state.instances) : [...state.instances];
}
