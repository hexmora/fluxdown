import { forEach } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { DestructibleTarget } from '../../../destructible';
import type {
  Distinctor,
  IReactiveState,
  StateMapper,
  StateSource,
  StateValue,
  StateValues,
} from '../../../reactive-state';
import type { FlattenedState, IReadableClosure, StateClosureSource } from '../../type';
import type {
  BuiltClosure,
  MarkedStateClosureDescriptor,
  StateClosureDescriptor,
  StateClosureResult,
  StateClosureResultNode,
  StateClosureResultValue,
} from '../render';
import type { StateClosureRef } from './type';

import {
  combineMapClosure,
  flattenClosure,
  mapClosure,
  selectClosure,
  toClosure,
} from '../../main';
import { mapKeyedClosure } from '../keyed';
import { mapEachClosure, switchMapClosure } from '../operator';
import { render } from '../render';
import { getReadableClosureScope, ownReadableClosure } from '../render/utils/context';
import { isStateClosureDescriptor } from '../render/utils/predicates';
import { StateClosureHookRuntime } from './utils';

export * from './type';

export const useMap = <S, R>(
  source: S,
  mapper: StateMapper<StateValue<S>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  const { owner } = StateClosureHookRuntime.require('useMap', 'once');

  return ownReadableClosure(getReadableClosureScope(owner), mapClosure(source, mapper, distinctor));
};

export const useSelect = <S, R>(
  source: S,
  mapper: StateMapper<StateValue<S>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  const { owner } = StateClosureHookRuntime.require('useSelect', 'once');

  return ownReadableClosure(
    getReadableClosureScope(owner),
    selectClosure(source, mapper, distinctor),
  );
};

export function useSwitchMap<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => R & StateClosureResultNode,
  distinctor?: Distinctor<StateClosureResultValue<R>>,
): IReadableClosure<StateClosureResultValue<R>>;
export function useSwitchMap<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => StateClosureResult<R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function useSwitchMap<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => StateClosureResult<R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> {
  const { owner } = StateClosureHookRuntime.require('useSwitchMap', 'once');

  return ownReadableClosure(
    getReadableClosureScope(owner),
    switchMapClosure<S, R>(source, mapper, distinctor),
  );
}

/**
 * Derive a readable closure for each field present in the initial source value.
 */
export const useFlatten = <T extends object>(
  source: IReadableClosure<T> | IReactiveState<T>,
): FlattenedState<T> => {
  const { owner } = StateClosureHookRuntime.require('useFlatten', 'once');

  const fields = flattenClosure(source);

  forEach(fields, (field) => {
    ownReadableClosure(getReadableClosureScope(owner), field);
  });

  return fields;
};

export function useMapEach<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => MarkedStateClosureDescriptor<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]>;
export function useMapEach<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => StateClosureSource<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]>;
export function useMapEach<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => StateClosureSource<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]> {
  const { owner } = StateClosureHookRuntime.require('useMapEach', 'once');

  return ownReadableClosure(
    getReadableClosureScope(owner),
    mapEachClosure(source, mapper, itemDistinctor),
  );
}

export function useMapKeyed<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: T) => MarkedStateClosureDescriptor<R>,
): IReadableClosure<R[]>;
export function useMapKeyed<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: T) => StateClosureSource<R>,
): IReadableClosure<R[]>;
export function useMapKeyed<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: T) => StateClosureSource<R>,
): IReadableClosure<R[]> {
  const { owner } = StateClosureHookRuntime.require('useMapKeyed', 'once');

  return ownReadableClosure(getReadableClosureScope(owner), mapKeyedClosure(source, mapper));
}

export const useCombineMap = <const TSources extends [unknown, ...unknown[]], R>(
  sources: [...TSources],
  mapper: StateMapper<StateValues<TSources>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  const { owner } = StateClosureHookRuntime.require('useCombineMap', 'once');

  return ownReadableClosure(
    getReadableClosureScope(owner),
    combineMapClosure(sources, mapper, distinctor),
  );
};

export function useCreate<const D extends StateClosureDescriptor<unknown>>(
  source: D,
): BuiltClosure<D>;
export function useCreate<T>(source: StateClosureSource<T>): IReadableClosure<T>;
export function useCreate<T>(source: StateClosureSource<T>): IReadableClosure<T> {
  const { owner } = StateClosureHookRuntime.require('useCreate', 'once');

  return ownReadableClosure(
    getReadableClosureScope(owner),
    isStateClosureDescriptor<T>(source) ? render<T>(source) : toClosure(source),
  );
}

export const useDefaults = <T>(
  source: IReadableClosure<T> | null | undefined,
  fallback: StateClosureSource<T>,
): IReadableClosure<T> => {
  StateClosureHookRuntime.require('useDefaults', 'once');

  return useCreate(source ?? fallback);
};

export const useDefaultsFalsy = <T>(
  source: IReadableClosure<T> | null | undefined | false | 0 | '' | 0n,
  fallback: StateClosureSource<T>,
): IReadableClosure<T> => {
  StateClosureHookRuntime.require('useDefaultsFalsy', 'once');

  return useCreate(source || fallback);
};

export const useCombine = <const TSources extends [unknown, ...unknown[]]>(
  ...sources: TSources
): IReadableClosure<StateValues<TSources>> => {
  return useCombineMap<TSources, StateValues<TSources>>(sources, (values) => values, shallowEqual);
};

export const useClearable = <T extends DestructibleTarget>(target: T): T => {
  return StateClosureHookRuntime.require('useClearable').clearable(target);
};

export const useRef = <T>(initialValue: T): StateClosureRef<T> => {
  return StateClosureHookRuntime.require('useRef', 'mapper').ref(initialValue);
};

export const useCurrent = <T>(factory: () => T): T => {
  return StateClosureHookRuntime.require('useCurrent', 'mapper').current(factory);
};

export const useStableFn = <TParams extends unknown[], TReturn>(
  callback: (...params: TParams) => TReturn,
): ((...params: TParams) => TReturn) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  return useCurrent(
    () =>
      (...params: TParams) =>
        callbackRef.current(...params),
  );
};
