import type { MapperInputs } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import {
  D,
  isReactiveStateLike,
  isReadableClosure,
  mapClosure,
  switchMapClosure,
  useClearable,
} from 'stative';

import { isPluginConfigEqual } from '../../../plugin-builder';

type UseMapperInputsOptions = MapperInputs & {
  config: IReadableClosure<object | undefined>;
};

/** Keep a stable field closure even when an optional field first appears after construction. */
export const useMapperInputs = ({ config, source }: UseMapperInputsOptions): MapperInputs => {
  const fields = new Map<PropertyKey, IReadableClosure<unknown>>();

  useClearable(() => {
    for (const field of fields.values()) {
      field.destroy();
    }

    fields.clear();
  });

  const inputs = new Proxy(
    { source },
    {
      get(target, key, receiver) {
        if (Object.hasOwn(target, key)) {
          return Reflect.get(target, key, receiver);
        }

        if (key === 'priority' || key === 'disabled') {
          return undefined;
        }

        let field = fields.get(key);

        if (!field) {
          const value = mapClosure(
            config,
            (options): unknown =>
              options && Object.hasOwn(options, key) ? Reflect.get(options, key) : undefined,
            isPluginConfigEqual,
          );

          // Borrow caller-owned states and preserve ordinary objects, arrays, and functions.
          field = switchMapClosure(
            value,
            (current) => {
              const state = isReadableClosure(current) ? current.value : undefined;

              return isReactiveStateLike(state) ? state : D(current);
            },
            isPluginConfigEqual,
          );

          fields.set(key, field);
        }

        return field;
      },

      ownKeys() {
        return [
          'source',
          ...Reflect.ownKeys(config.value.value ?? {}).filter(
            (key) => key !== 'source' && key !== 'priority' && key !== 'disabled',
          ),
        ];
      },

      getOwnPropertyDescriptor(target, key) {
        const descriptor = Reflect.getOwnPropertyDescriptor(target, key);

        if (descriptor || key === 'priority' || key === 'disabled') {
          return descriptor;
        }

        return Object.hasOwn(config.value.value ?? {}, key)
          ? { configurable: true, enumerable: true, get: () => Reflect.get(inputs, key) }
          : undefined;
      },

      has(target, key) {
        return (
          Object.hasOwn(target, key) ||
          (key !== 'priority' && key !== 'disabled' && Object.hasOwn(config.value.value ?? {}, key))
        );
      },
    },
  );

  return inputs;
};
