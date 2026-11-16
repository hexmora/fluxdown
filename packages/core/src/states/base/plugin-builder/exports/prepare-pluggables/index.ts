import type { PluginHooks } from '@fluxdown/types';

import { isArray, isNil } from 'lodash-es';

import type { AnyPluggable } from '../../type';

import { isPluggableEnabled } from '../pluggables';

export const preparePluggables = <T extends AnyPluggable, C>(pluggables: T[], context: C): T[] => {
  return pluggables.filter(isPluggableEnabled).flatMap((pluggable): T[] => {
    const Plugin = isArray(pluggable) ? pluggable[0] : pluggable;

    // A heterogeneous list erases each plugin's context type at this dispatch boundary.
    const hooks = Plugin as PluginHooks<C>;

    if (hooks.enabled?.(context) === false) {
      return [];
    }

    const outerConfig = isArray(pluggable) ? pluggable[1] : {};

    const config = hooks.prepareConfig?.(context, outerConfig);

    const prepared = isNil(config) ? pluggable : ([Plugin, config] as T);

    return isPluggableEnabled(prepared) ? [prepared] : [];
  });
};
