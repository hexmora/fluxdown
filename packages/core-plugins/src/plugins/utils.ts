import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import { isArray } from 'lodash-es';

/**
 * Inspect plugin configuration by its stable key without importing its implementation.
 */
export const getConfigIfEnabled = <T extends IPluginWithConfig>(
  plugins: IPluggable<T, unknown>[],
  key: string,
): Record<string, unknown> | undefined => {
  const pluggable = plugins.find((item) => (isArray(item) ? item[0] : item).key === key);

  if (!pluggable) {
    return;
  }

  const config = isArray(pluggable) ? pluggable[1] : {};

  return config.disabled === true ? undefined : config;
};
