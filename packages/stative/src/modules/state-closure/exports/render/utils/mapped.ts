import { shallowEqual } from 'shallow-equal';

import type { Distinctor } from '../../../../reactive-state';
import type { IReadableClosure } from '../../../type';
import type { AnyMappingFunction, StateClosureResult } from './type';

import { combineMapState, ReactiveState } from '../../../../reactive-state';
import { FactoryReadableClosure } from '../../base';
import { StateClosureHookRuntime } from '../../hooks/runtime';
import { getMapperComparers } from '../../memo';
import { clearWithDescriptorScope, getReadableClosureScope } from './context';

/** Builds functional closures lazily and keeps mapper hooks local to each instance. */
export const createMappedStateClosure = <T>(
  mapper: AnyMappingFunction,
  readInputs: () => unknown,
  dependencies: IReadableClosure<unknown>[],
  kind: 'mapper' | 'once',
  distinctor?: Distinctor<T>,
): IReadableClosure<T> => {
  const createOutput = () => {
    const comparers = getMapperComparers(mapper);

    let previous: { inputs: unknown; result: T } | null = null;

    const read = () => {
      const inputs = readInputs();

      if (previous && comparers?.inputs?.(previous.inputs, inputs)) {
        return previous.result;
      }

      const result = hooks.render(() => mapper(inputs)) as T;

      previous = { inputs, result };

      return result;
    };

    const [first, ...rest] = dependencies;

    const state = first
      ? combineMapState(
          [first.value, ...rest.map((dependency) => dependency.value)],
          (values, prev) => (prev && shallowEqual(values, prev[0]) ? prev[1] : read()),
          distinctor ?? comparers?.returns,
        )
      : ReactiveState.of(read());

    return state;
  };

  const closure: IReadableClosure<T> =
    kind === 'once'
      ? FactoryReadableClosure.create<T>(
          () => hooks.render(() => mapper(readInputs())) as StateClosureResult<T>,
        )
      : FactoryReadableClosure.create<T>(createOutput, true);

  const hooks = new StateClosureHookRuntime(kind, closure);

  clearWithDescriptorScope(getReadableClosureScope(closure), () => hooks.destroy());

  return closure;
};
