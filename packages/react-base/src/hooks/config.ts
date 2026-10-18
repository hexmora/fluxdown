import type { FlattenedState } from 'stative';

import { useDeferredUnmount, useStateOf, useStatic } from '@fluxdown/react-base-presets/base';
import { forEach } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { flattenClosure } from 'stative';

export const usePluginConfig = <T extends object>(config: T): FlattenedState<T> => {
  const source = useStateOf(config, shallowEqual);

  const fields = useStatic(() => flattenClosure(source));

  useDeferredUnmount(() => forEach(fields, (field) => field.destroy()));

  return fields;
};
