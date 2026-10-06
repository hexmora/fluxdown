import type { IPluggable, IPluginWithConfig, PluginSet } from '@fluxdown/types';

import { isArray, isObject, isPlainObject } from 'lodash-es';

import { isPluginSetTuple } from '../../../base/plugin-builder/utils';

export const isShareablePluginConfig = (value: unknown, ancestors: object[] = []): boolean => {
  if (!isObject(value)) {
    return true;
  }

  if ((!isArray(value) && !isPlainObject(value)) || ancestors.includes(value)) {
    return false;
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);

  const nextAncestors = [...ancestors, value];

  return Reflect.ownKeys(descriptors).every((key) => {
    const descriptor = descriptors[key as keyof typeof descriptors];

    return (
      !!descriptor &&
      'value' in descriptor &&
      isShareablePluginConfig(descriptor.value, nextAncestors)
    );
  });
};

export const isShareablePluginSet = <T extends IPluginWithConfig, C extends object>(
  plugins: PluginSet<IPluggable<T, unknown>, C>,
): boolean => {
  if (!isArray(plugins)) {
    return isShareablePluginConfig(plugins);
  }

  const [pluggables, config] = isPluginSetTuple(plugins) ? plugins : [plugins, undefined];

  return (
    isShareablePluginConfig(config) &&
    pluggables.every((plugin) => !isArray(plugin) || isShareablePluginConfig(plugin[1]))
  );
};
