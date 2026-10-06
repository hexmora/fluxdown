import { isArray, isPlainObject, mapValues, values } from 'lodash-es';
import { Subscription } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type { DestructibleTarget } from '../../destructible';
import type {
  Distinctor,
  IReactiveState,
  StateMapper,
  StateSource,
  StateValue,
  StateValues,
} from '../../reactive-state';
import type { StateSubscription } from '../../reactive-state/observe';
import type { FlattenedState, IReadableClosure, ListEntry, StateClosureSource } from '../type';
import type {
  BuiltClosure,
  MarkedStateClosureDescriptor,
  StateClosureDescriptor,
  StateClosureResult,
  StateClosureResultNode,
  StateClosureResultValue,
} from './render';

import { assert } from '../../../utils';
import { Destructible } from '../../destructible';
import { clearByTarget } from '../../destructible/utils';
import { MutableState } from '../../mutable-state';
import {
  combineMapState,
  computedState,
  isReactiveStateLike,
  mapState,
  ReactiveState,
  selectState,
  toState,
} from '../../reactive-state';
import { isNativeState, observeState, readPublishedState } from '../../reactive-state/observe';
import { batch } from '../../state-graph/batch';
import { withStateContext } from '../../state-graph/context';
import { getStateNode } from '../../state-graph/node';
import {
  isResolvedClosureSource,
  isResolvedImmediateSource,
  resolveResult,
  resolveSource,
} from '../utils';
import { withStateClosureHookRuntime } from './hooks/runtime/utils';
import { mapKeyedClosure } from './keyed';
import { OwnedStateView } from './owned-state-view';
import { OwnedValueState } from './owned-value-state';
import { isImmediateDescriptor, isStateClosureDescriptor, render } from './render';
import {
  bindRootDescriptorScope,
  clearWithDescriptorScope,
  consumeDescriptorScope,
  detachWithDescriptorScope,
  getReadableClosureScope,
  ownReadableClosure,
  releaseReadableClosure,
} from './render/utils/context';
import { isReadableClosure } from './render/utils/resolve';

type OwnedReactiveState<T> = IReactiveState<T> & { destroy(): void };

type CollectionEntry<T, R> = Omit<ListEntry<T, R>, 'subscription'> & {
  value: R;
  native: boolean;
  completed: boolean;
  subscription?: StateSubscription;
};

export const toClosure = <T>(source: StateClosureSource<T>): IReadableClosure<T> => {
  return isReadableClosure<T>(source) ? source : new SourceReadableClosure({ source });
};

export const mapClosure = <S, R>(
  source: S,
  mapper: StateMapper<StateValue<S>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  return new DerivedReadableClosure(source, () =>
    mapState(
      source,
      (value, prev) => withStateClosureHookRuntime(null, () => mapper(value, prev)),
      distinctor,
    ),
  );
};

export const selectClosure = <S, R>(
  source: S,
  mapper: StateMapper<StateValue<S>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  return new DerivedReadableClosure(source, () =>
    selectState(
      source,
      (value, prev) => withStateClosureHookRuntime(null, () => mapper(value, prev)),
      distinctor,
    ),
  );
};

/** Derive field closures from the initial value without taking ownership of the source. */
export const flattenClosure = <T extends object>(
  source: IReadableClosure<T> | IReactiveState<T>,
): FlattenedState<T> => {
  const state = toState(source);

  return mapValues(state.value, (_, key) =>
    mapClosure(state, (value) => value[key as keyof T]),
  ) as FlattenedState<T>;
};

/**
 * Follows the latest mapped child and releases the previous child graph on replacement.
 * Consecutive returns of the same raw state reuse its child closure and subscription.
 * Completed flows retain the final child graph until the closure is destroyed.
 */
export function switchMapClosure<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => R & StateClosureResultNode,
  distinctor?: Distinctor<StateClosureResultValue<R>>,
): IReadableClosure<StateClosureResultValue<R>>;
export function switchMapClosure<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => StateClosureResult<R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function switchMapClosure<S, R>(
  source: S,
  mapper: (value: StateValue<S>) => StateClosureResult<R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> {
  const closure = FactoryReadableClosure.create(() => {
    const input = toState(source);

    let cached: [IReactiveState<R>, IReadableClosure<R>] | null = null;

    clearWithDescriptorScope(scope, () => {
      cached = null;
    });

    const handleCreate = (value: StateValue<S>) =>
      ownReadableClosure(
        scope,
        FactoryReadableClosure.create(() => {
          const result = withStateClosureHookRuntime(null, () => mapper(value));

          if (!isImmediateDescriptor(result) && isReactiveStateLike<R>(result)) {
            if (cached && cached[0] === result) {
              return cached[1];
            }

            const child = render<R>(result);

            cached = [result, child];

            return child;
          }

          cached = null;

          return render<R>(result);
        }),
      );

    let previous = input.value;

    let current = handleCreate(previous);

    let inner = current.value;

    const state: ReactiveState<R> = new ReactiveState({
      initial: inner.value,

      distinctor,

      emitter: (observer) => {
        const subscriptions = new Subscription();

        let subscription: StateSubscription | null = null;

        let stopped = false;

        let completed = false;

        const handleError = (error: unknown) => {
          if (!stopped) {
            stopped = true;

            observer.error(error);
          }
        };

        const handleSchedule = () => {
          getStateNode(state).schedule(handleUpdate);
        };

        const handleSubscribe = () => {
          subscription = observeState(inner, {
            next: handleSchedule,

            error: handleError,

            complete: handleSchedule,
          });
        };

        const handleUpdate = () => {
          if (stopped) {
            return;
          }

          try {
            const value = input.value;

            if (!Object.is(value, previous)) {
              const next = handleCreate(value);

              const nextState = next.value;

              subscription?.unsubscribe();

              releaseReadableClosure(scope, current);

              previous = value;

              current = next;

              inner = nextState;

              handleSubscribe();
            }

            observer.next(inner.value);

            if (input.closed && inner.closed) {
              stopped = true;

              completed = true;

              observer.complete();
            }
          } catch (error) {
            handleError(error);
          }
        };

        batch(() => {
          handleSubscribe();

          subscriptions.add(
            observeState(input, {
              next: handleSchedule,

              error: handleError,

              complete: handleSchedule,
            }),
          );
        });

        return () => {
          stopped = true;

          cached = null;

          subscriptions.unsubscribe();

          subscription?.unsubscribe();

          if (!completed) {
            releaseReadableClosure(scope, current);
          }
        };
      },
    });

    return state;
  }, true);

  const scope = getReadableClosureScope(closure);

  if (isReadableClosure(source)) {
    ownReadableClosure(scope, source);
  }

  return closure;
}

export const combineMapClosure = <const TSources extends [unknown, ...unknown[]], R>(
  sources: [...TSources],
  mapper: StateMapper<StateValues<TSources>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  return new DerivedReadableClosure(sources, () =>
    combineMapState(
      sources,
      (value, prev) => withStateClosureHookRuntime(null, () => mapper(value, prev)),
      distinctor,
    ),
  );
};

/** Pure projections stay unsubscribed until observed and compute synchronous reads on demand. */
export const computedClosure = <const TSources extends [unknown, ...unknown[]], R>(
  sources: [...TSources],
  mapper: (values: StateValues<TSources>) => R,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> => {
  return new DerivedReadableClosure(sources, () =>
    computedState(
      sources,
      (currentValues) => withStateClosureHookRuntime(null, () => mapper(currentValues)),
      distinctor,
    ),
  );
};

/**
 * Keeps one owned state flow per list position and follows its current value.
 * Branded descriptors infer their resolved value before inspecting tuple factories.
 */
export function mapEachClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => MarkedStateClosureDescriptor<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]>;
export function mapEachClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => StateClosureSource<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]>;
export function mapEachClosure<T, R>(
  source: StateSource<readonly T[]>,
  mapper: (item: IReadableClosure<T>, index: number) => StateClosureSource<R>,
  itemDistinctor?: Distinctor<T>,
): IReadableClosure<R[]> {
  const closure = FactoryReadableClosure.create(() => {
    const sourceState = input.value;

    const createEntry = (value: T, index: number): CollectionEntry<T, R> => {
      const item = new MutableState({ initial: value, distinctor: itemDistinctor });

      getStateNode(item).dependOn(getStateNode(sourceState), { ordering: true });

      const readable = FactoryReadableClosure.create(() => item);

      clearWithDescriptorScope(getReadableClosureScope(readable), () => item.destroy());

      const child = FactoryReadableClosure.create(() => toClosure(mapper(readable, index)));

      ownReadableClosure(getReadableClosureScope(child), readable);
      ownReadableClosure(scope, child);

      try {
        const state = child.value;

        return {
          input: item,
          closure: child,
          state,
          value: state.value,
          native: isNativeState(state),
          completed: state.closed,
        };
      } catch (error) {
        releaseReadableClosure(scope, child);

        throw error;
      }
    };

    const releaseEntries = (items: CollectionEntry<T, R>[]) => {
      const cleanup = new Subscription();

      for (const entry of items) {
        cleanup.add(() => {
          entry.subscription?.unsubscribe();

          releaseReadableClosure(scope, entry.closure);
        });
      }

      cleanup.unsubscribe();
    };

    let previousItems = sourceState.value;
    const entries = previousItems.map(createEntry);

    const state: ReactiveState<R[]> = new ReactiveState({
      initial: entries.map((entry) => entry.value),
      distinctor: shallowEqual,
      emitter: (observer) => {
        const subscriptions = new Subscription();

        let stopped = false;
        let completed = false;

        let valuesChanged = false;

        const fail = (error: unknown) => {
          if (stopped) {
            return;
          }

          stopped = true;

          observer.error(error);
        };

        const refresh = () => {
          if (stopped) {
            return;
          }

          try {
            if (valuesChanged) {
              valuesChanged = false;

              observer.next(
                entries.map((entry) => (entry.native ? entry.value : entry.state.value)),
              );
            }

            if (
              completed &&
              entries.every((entry) => (entry.native ? entry.completed : entry.state.closed))
            ) {
              stopped = true;

              observer.complete();
            }
          } catch (error) {
            fail(error);
          }
        };

        const scheduleRefresh = () => {
          getStateNode(state).schedule(refresh);
        };

        const connectEntry = (entry: CollectionEntry<T, R>) => {
          let connecting = true;

          entry.subscription = observeState(entry.state, {
            next: (value) => {
              const current = connecting ? entry.state.value : value;

              if (!entry.native || !Object.is(entry.value, current)) {
                entry.value = current;

                valuesChanged = true;

                scheduleRefresh();
              }
            },
            error: fail,
            complete: () => {
              entry.completed = true;

              if (completed) {
                scheduleRefresh();
              }
            },
          });

          connecting = false;

          subscriptions.add(entry.subscription);
        };

        const update = (items: readonly T[]) => {
          if (stopped || items === previousItems) {
            return;
          }

          const created: CollectionEntry<T, R>[] = [];

          try {
            for (let index = entries.length; index < items.length; index++) {
              created.push(createEntry(items[index], index));
            }

            const retainedLength = Math.min(entries.length, items.length);
            const previous = previousItems;
            const removed = items.length < entries.length ? entries.splice(items.length) : [];

            for (const entry of created) {
              entries.push(entry);
            }

            previousItems = items;

            if (removed.length > 0 || created.length > 0) {
              valuesChanged = true;
            }

            batch(() => {
              for (let index = 0; index < retainedLength; index++) {
                if (itemDistinctor || !Object.is(previous[index], items[index])) {
                  entries[index].input.next(items[index]);
                }
              }

              if (itemDistinctor) {
                for (let index = retainedLength; index < entries.length; index++) {
                  entries[index].input.next(items[index]);
                }
              }

              created.forEach(connectEntry);

              releaseEntries(removed);

              if (valuesChanged) {
                scheduleRefresh();
              }
            });
          } catch (error) {
            releaseEntries(created);
            fail(error);
          }
        };

        batch(() => {
          entries.forEach(connectEntry);

          subscriptions.add(
            observeState(sourceState, {
              next: update,
              error: fail,
              complete: () => {
                completed = true;

                batch(() => {
                  entries.forEach((entry) => entry.input.complete());
                  scheduleRefresh();
                });
              },
            }),
          );
        });

        return () => {
          stopped = true;

          subscriptions.unsubscribe();
        };
      },
    });

    return state;
  }, true);

  const scope = getReadableClosureScope(closure);
  const input = ownReadableClosure(scope, toClosure(source));

  return closure;
}

export abstract class BaseStateClosure<T, TInputs = void>
  extends Destructible
  implements IReadableClosure<T>
{
  private _value: IReactiveState<T> | null = null;

  /** Custom writable closures retain a mutable output; internal graphs can own or borrow it. */
  protected get outputMode(): 'mutable' | 'view' | 'owned' {
    return 'mutable';
  }

  readonly inputs: TInputs;

  constructor(inputs: TInputs) {
    super();

    this.inputs = inputs;

    const scope = consumeDescriptorScope();

    if (scope) {
      bindRootDescriptorScope(scope, this);
    }

    getReadableClosureScope(this);

    // Descriptor inputs are already owned; rescanning would also capture D-wrapped values.
    if (scope) {
      return;
    }

    const inputValues =
      isPlainObject(inputs) && !isReactiveStateLike(inputs) && !isReadableClosure(inputs)
        ? values(inputs)
        : [inputs];

    for (const input of inputValues) {
      if (isReadableClosure(input)) {
        this.own(input);
      }
    }
  }

  private createState(source: IReactiveState<T> | null, initial: T): IReactiveState<T> {
    if (source && this.outputMode === 'owned') {
      detachWithDescriptorScope(getReadableClosureScope(this), () => {
        (source as OwnedReactiveState<T>).destroy();
      });

      return source;
    }

    if (source && this.outputMode === 'view' && isNativeState(source)) {
      // Reading the native publication does not set up a ReactiveState. A terminal
      // source is already an immutable handle and needs no extra lifetime boundary.
      if (source instanceof ReactiveState && readPublishedState(source).closed) {
        return source;
      }

      const state = new OwnedStateView(source);

      detachWithDescriptorScope(getReadableClosureScope(this), () => state.destroy());

      return state;
    }

    if (!source) {
      return this.clearable(
        this.outputMode === 'mutable' ? MutableState.of(initial) : new OwnedValueState(initial),
      );
    }

    return this.createForwardedState(source);
  }

  private createForwardedState(source: IReactiveState<T>): MutableState<T> {
    const initial = source.value;

    let state: MutableState<T> | null = null;

    let pending: { value: T; terminal?: 'complete' | { error: unknown } } | null = {
      value: initial,
    };

    const subscription = withStateContext(null, () =>
      observeState(source, {
        next: (value) => {
          if (state) {
            state.next(value);

            return;
          }

          if (pending && !pending.terminal) {
            pending.value = source.value;
          }
        },

        error: (error) => {
          if (state) {
            state.error(error);

            return;
          }

          if (pending && !pending.terminal) {
            pending.terminal = { error };
          }
        },

        complete: () => {
          if (state) {
            state.complete();

            return;
          }

          if (pending && !pending.terminal) {
            pending.terminal = 'complete';
          }
        },
      }),
    );

    detachWithDescriptorScope(getReadableClosureScope(this), () => subscription.unsubscribe());

    // Capture subscription-time events without retaining their buffer after setup.
    const { value, terminal } = pending;

    pending = null;

    if (terminal && terminal !== 'complete') {
      throw terminal.error;
    }

    state = this.clearable(MutableState.of(value));

    if (terminal === 'complete') {
      state.complete();
    }

    getStateNode(state).dependOn(getStateNode(source));

    return state;
  }

  private setup() {
    if (this._value !== null) {
      return this._value;
    }

    assert(!this.destroyed, 'Cannot set up a destroyed state closure.');

    try {
      const resolvedSource = resolveResult(withStateClosureHookRuntime(null, () => this.render()));

      const directSource = isResolvedClosureSource(resolvedSource)
        ? this.own(resolvedSource.source).value
        : resolvedSource.source;

      const reactiveSource =
        !isResolvedImmediateSource(resolvedSource) && isReactiveStateLike<T>(directSource)
          ? directSource
          : null;

      const state = this.createState(reactiveSource, directSource as T);

      this._value = state;

      return state;
    } catch (error) {
      this.destroy();

      throw error;
    }
  }

  get value(): IReactiveState<T> {
    return this.setup();
  }

  protected override clearable<R extends DestructibleTarget>(target: R): R {
    if (isReadableClosure(target)) {
      return this.own(target);
    }

    clearWithDescriptorScope(getReadableClosureScope(this), () => clearByTarget(target));

    return target;
  }

  protected map<S, R>(
    source: S,
    mapper: StateMapper<StateValue<S>, R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R> {
    return this.own(mapClosure(source, mapper, distinctor));
  }

  protected select<S, R>(
    source: S,
    mapper: StateMapper<StateValue<S>, R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R> {
    return this.own(selectClosure(source, mapper, distinctor));
  }

  protected switchMap<S, R>(
    source: S,
    mapper: (value: StateValue<S>) => R & StateClosureResultNode,
    distinctor?: Distinctor<StateClosureResultValue<R>>,
  ): IReadableClosure<StateClosureResultValue<R>>;
  protected switchMap<S, R>(
    source: S,
    mapper: (value: StateValue<S>) => StateClosureResult<R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R>;
  protected switchMap<S, R>(
    source: S,
    mapper: (value: StateValue<S>) => StateClosureResult<R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R> {
    return this.own(switchMapClosure<S, R>(source, mapper, distinctor));
  }

  protected mapEach<A, R>(
    source: StateSource<readonly A[]>,
    mapper: (item: IReadableClosure<A>, index: number) => MarkedStateClosureDescriptor<R>,
    itemDistinctor?: Distinctor<A>,
  ): IReadableClosure<R[]>;
  protected mapEach<A, R>(
    source: StateSource<readonly A[]>,
    mapper: (item: IReadableClosure<A>, index: number) => StateClosureSource<R>,
    itemDistinctor?: Distinctor<A>,
  ): IReadableClosure<R[]>;
  protected mapEach<A, R>(
    source: StateSource<readonly A[]>,
    mapper: (item: IReadableClosure<A>, index: number) => StateClosureSource<R>,
    itemDistinctor?: Distinctor<A>,
  ): IReadableClosure<R[]> {
    return this.own(mapEachClosure(source, mapper, itemDistinctor));
  }

  protected mapKeyed<A, R>(
    source: StateSource<readonly A[]>,
    mapper: (item: A) => MarkedStateClosureDescriptor<R>,
  ): IReadableClosure<R[]>;
  protected mapKeyed<A, R>(
    source: StateSource<readonly A[]>,
    mapper: (item: A) => StateClosureSource<R>,
  ): IReadableClosure<R[]>;
  protected mapKeyed<A, R>(
    source: StateSource<readonly A[]>,
    mapper: (item: A) => StateClosureSource<R>,
  ): IReadableClosure<R[]> {
    return this.own(mapKeyedClosure(source, mapper));
  }

  protected create<const D extends StateClosureDescriptor<unknown>>(source: D): BuiltClosure<D>;
  protected create<R>(source: StateClosureSource<R>): IReadableClosure<R>;
  protected create<R>(source: StateClosureSource<R>): IReadableClosure<R> {
    return this.own(isStateClosureDescriptor<R>(source) ? render<R>(source) : toClosure(source));
  }

  protected defaults<R>(
    source: IReadableClosure<R> | null | undefined,
    fallback: StateClosureSource<R>,
  ): IReadableClosure<R> {
    return this.create(source ?? fallback);
  }

  protected defaultsFalsy<R>(
    source: IReadableClosure<R> | null | undefined | false | 0 | '' | 0n,
    fallback: StateClosureSource<R>,
  ): IReadableClosure<R> {
    return this.create(source || fallback);
  }

  protected combineMap<const TSources extends [unknown, ...unknown[]], R>(
    sources: [...TSources],
    mapper: StateMapper<StateValues<TSources>, R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R> {
    return this.own(combineMapClosure(sources, mapper, distinctor));
  }

  protected combine<const TSources extends [unknown, ...unknown[]]>(
    ...sources: TSources
  ): IReadableClosure<StateValues<TSources>> {
    return this.combineMap<TSources, StateValues<TSources>>(
      sources,
      (stateValues) => stateValues,
      shallowEqual,
    );
  }

  protected own<C extends IReadableClosure<unknown>>(closure: C): C {
    return ownReadableClosure(getReadableClosureScope(this), closure);
  }

  protected release(closure: IReadableClosure<unknown>) {
    releaseReadableClosure(getReadableClosureScope(this), closure);
  }

  protected next(newValue: T) {
    const state = this.setup();

    assert(state instanceof MutableState, 'This closure has no writable output.');

    state.next(newValue);
  }

  protected abstract render(): StateClosureResult<T>;
}

class SourceReadableClosure<T> extends BaseStateClosure<T> {
  private source: StateClosureSource<T> | undefined;

  constructor({ source }: { source: StateClosureSource<T> }) {
    super(undefined);

    this.source = source;

    if (isReadableClosure(source)) {
      this.own(source);
    }
  }

  protected override get outputMode() {
    return 'view' as const;
  }

  protected render(): StateClosureResult<T> {
    const source = this.source as StateClosureSource<T>;

    this.source = undefined;

    const resolved = resolveSource(source);

    if (isResolvedClosureSource(resolved)) {
      return resolved.source;
    }

    if (!isResolvedImmediateSource(resolved) && isReactiveStateLike<T>(resolved.source)) {
      return resolved.source;
    }

    return this.clearable(ReactiveState.of(resolved.source as T));
  }

  override destroy() {
    this.source = undefined;

    super.destroy();
  }
}

class DerivedReadableClosure<T, S> extends BaseStateClosure<T> {
  private factory: (() => OwnedReactiveState<T>) | null;

  protected override get outputMode() {
    return 'owned' as const;
  }

  constructor(source: S, factory: () => OwnedReactiveState<T>) {
    super(undefined);

    this.factory = factory;

    if (isArray(source)) {
      for (const item of source) {
        if (isReadableClosure(item)) {
          this.own(item);
        }
      }
    } else if (isReadableClosure(source)) {
      this.own(source);
    }
  }

  protected render() {
    const factory = this.factory!;

    this.factory = null;

    return factory();
  }

  override destroy() {
    this.factory = null;

    super.destroy();
  }
}

export class FactoryReadableClosure<T> extends BaseStateClosure<
  T,
  { factory: () => StateClosureResult<T>; owned?: boolean }
> {
  static create<T>(factory: () => OwnedReactiveState<T>, owned: true): FactoryReadableClosure<T>;
  static create<T>(factory: () => StateClosureResult<T>, owned?: false): FactoryReadableClosure<T>;
  static create<T>(factory: () => StateClosureResult<T>, owned = false): FactoryReadableClosure<T> {
    return new FactoryReadableClosure({ factory, owned });
  }

  protected override get outputMode() {
    return this.inputs.owned ? ('owned' as const) : ('view' as const);
  }

  protected render() {
    const { factory } = this.inputs;

    return factory();
  }
}
