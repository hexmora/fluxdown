import type { StateClosureResultNode } from '..';

import { onceFunction } from '../../utils';

export { isOnceFunction } from '../../utils';

// oxlint-disable-next-line typescript/no-explicit-any
type StateFactory = (inputs: any) => StateClosureResultNode;

export type OnceFunctionMetadata = {
  readonly [onceFunction]: true;
};

export type OnceFunction<F extends StateFactory = StateFactory> = F & OnceFunctionMetadata;

export type AnyOnceFunction = OnceFunction;

/** Declares a function that builds its state flow once, on the first value access. */
export const once = <F extends StateFactory>(factory: F): OnceFunction<F> => {
  return new Proxy(factory, {
    get(target, key, receiver) {
      return key === onceFunction ? true : Reflect.get(target, key, receiver);
    },
  }) as OnceFunction<F>;
};
