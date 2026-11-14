import type { IPluggable, IPluginWithConfig, PluginClass } from '@fluxdown/types';

import { isArray } from 'lodash-es';

/** Inspect the original descriptors without importing compiler orchestration. */
export const getEnabledPluginConfig = <T extends IPluginWithConfig>(
  plugins: IPluggable<T, unknown>[],
  Plugin: PluginClass<T>,
): Record<string, unknown> | undefined => {
  const pluggable = plugins.find((item) => (isArray(item) ? item[0] : item) === Plugin);

  if (!pluggable) {
    return;
  }

  const config = isArray(pluggable) ? pluggable[1] : {};

  return config.disabled === true ? undefined : config;
};
