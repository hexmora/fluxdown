import type { IPluggable, IPluginWithConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { first } from 'lodash-es';

import { buildPlugin } from './utils';

export function buildPluggables<T extends IPluginWithConfig>(): T[];

export function buildPluggables<T extends IPluginWithConfig>(pluggable: IPluggable<T, unknown>): T;

export function buildPluggables<T extends IPluginWithConfig>(
  first: IPluggable<T, unknown>,
  second: IPluggable<T, unknown>,
  ...rest: IPluggable<T, unknown>[]
): T[];

export function buildPluggables<T extends IPluginWithConfig>(
  ...pluggables: IPluggable<T, unknown>[]
): T | T[];

export function buildPluggables<T extends IPluginWithConfig>(
  ...pluggables: IPluggable<T, unknown>[]
): T | T[] {
  const instances = pluggables.map(buildPlugin);

  if (instances.length !== 1) {
    return instances;
  }

  const instance = first(instances);

  assert(instance, 'A single pluggable must produce one plugin instance.');

  return instance;
}
