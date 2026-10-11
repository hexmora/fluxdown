import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import { isArray } from 'lodash-es';

const releaseFailedPlugin = (instance: IPluginWithConfig, error: unknown): never => {
  try {
    if ('destroy' in instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
  } catch (cleanupError) {
    throw new AggregateError([error, cleanupError], 'Failed to configure and release a plugin.', {
      cause: cleanupError,
    });
  }

  throw error;
};

export const buildPlugin = <T extends IPluginWithConfig>(pluggable: IPluggable<T, unknown>): T => {
  if (!isArray(pluggable)) {
    return new pluggable();
  }

  const [Plugin, config] = pluggable;

  const instance = new Plugin(config);

  try {
    if (config?.priority !== undefined) {
      Object.defineProperty(instance, 'config', {
        configurable: true,
        enumerable: true,
        value: { ...instance.config, priority: config.priority },
      });
    }
  } catch (error) {
    releaseFailedPlugin(instance, error);
  }

  return instance;
};
