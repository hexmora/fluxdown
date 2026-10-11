import type {
  IPluggable,
  IPluginWithConfig,
  IRehypePlugin,
  IRemarkPlugin,
  IRepairPlugin,
  PluginSet,
} from '@fluxdown/types';

import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-presets/rehype';
import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-presets/repair';
import { isArray, isObject, isPlainObject } from 'lodash-es';

import type { BlockCompilerConfig } from '../../../../hast';
import type { RehypePluginSet, RemarkPluginSet, RepairPluginSet } from '../type';

import { isPluginSetTuple, toPluggable } from '../../../../base/plugin-builder/utils';
import { getPluggableClass } from '../../utils';
import { SHARED_REHYPE_PLUGINS, SHARED_REMARK_PLUGINS, SHARED_REPAIR_PLUGINS } from '../consts';

const isShareablePluginConfig = (value: unknown, ancestors: object[] = []): boolean => {
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

const isShareablePluginSet = <T extends IPluginWithConfig, C extends object>(
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

export const isShareableRemarkInputs = (
  config: BlockCompilerConfig,
  remarks: RemarkPluginSet,
  repairs: RepairPluginSet,
): boolean => {
  return (
    isShareablePluginConfig(config) &&
    isShareablePluginSet(PRESET_REMARK_PLUGINS) &&
    isShareablePluginSet(PRESET_REPAIR_PLUGINS) &&
    isShareablePluginSet(remarks) &&
    isShareablePluginSet(repairs) &&
    toPluggable(remarks, PRESET_REMARK_PLUGINS).every((plugin) =>
      SHARED_REMARK_PLUGINS.includes(getPluggableClass(plugin)),
    ) &&
    toPluggable(repairs, PRESET_REPAIR_PLUGINS).every((plugin) =>
      SHARED_REPAIR_PLUGINS.includes(getPluggableClass(plugin)),
    )
  );
};

export const isShareableRehypeInputs = (
  config: BlockCompilerConfig,
  rehypes: RehypePluginSet,
): boolean => {
  return (
    isShareablePluginSet(PRESET_REHYPE_PLUGINS) &&
    isShareablePluginConfig(config) &&
    isShareablePluginSet(rehypes)
  );
};

export const isShareableRemarkPluggables = (
  plugins: IPluggable<IRemarkPlugin, unknown>[],
): boolean => {
  return (
    isShareablePluginSet(PRESET_REMARK_PLUGINS) &&
    plugins.every((plugin) => SHARED_REMARK_PLUGINS.includes(getPluggableClass(plugin)))
  );
};

export const isShareableRepairPluggables = (
  plugins: IPluggable<IRepairPlugin, unknown>[],
): boolean => {
  return (
    isShareablePluginSet(PRESET_REPAIR_PLUGINS) &&
    plugins.every((plugin) => SHARED_REPAIR_PLUGINS.includes(getPluggableClass(plugin)))
  );
};

export const isShareableRehypePluggables = (
  plugins: IPluggable<IRehypePlugin, unknown>[],
): boolean => {
  return (
    isShareablePluginSet(PRESET_REHYPE_PLUGINS) &&
    plugins.every(
      (plugin) =>
        SHARED_REHYPE_PLUGINS.includes(getPluggableClass(plugin)) &&
        (!isArray(plugin) || isShareablePluginConfig(plugin[1])),
    )
  );
};
