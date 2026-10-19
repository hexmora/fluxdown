import { isArray, isPlainObject, mapValues, values } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { DestructibleTarget } from '../destructible';
import type {
  Distinctor,
  IReactiveState,
  StateInputValue,
  StateMapper,
  StateSource,
  StateValue,
  StateValues,
} from '../reactive-state';
import type {
  BuiltClosure,
  MarkedStateClosureDescriptor,
  StateClosureDescriptor,
  StateClosureResult,
  StateClosureResultNode,
  StateClosureResultValue,
} from './exports';
import type {
  FlattenedState,
  IReadableClosure,
  StateClosureMode,
  StateClosureSource,
} from './type';

import {
  assert,
  bindRootDescriptorScope,
  clearWithDescriptorScope,
  DescriptorContext,
  detachWithDescriptorScope,
  getReadableClosureScope,
  isNativeStateLike,
  isReactiveStateLike,
  observeState,
  ownReadableClosure,
  releaseReadableClosure,
  StateContext,
  StateNode,
} from '../__internal__';
import { clearByTarget, Destructible } from '../destructible';
import { MutableState } from '../mutable-state';
import { mapState, ReactiveState, selectState, toState } from '../reactive-state';
import { mapKeyedClosure } from './exports';
import { mapEachClosure, switchMapClosure } from './exports';
import { isReadableClosure, render } from './exports';
import { StateClosureHookRuntime } from './utils';
import { isStateClosureDescriptor } from './utils';
import {
  isResolvedClosureSource,
  isResolvedImmediateSource,
  OwnedStateView,
  OwnedValueState,
  resolveResult,
  resolveSource,
} from './utils';

type OwnedReactiveState<T> = IReactiveState<T> & { destroy(): void };

export const toClosure = <T>(source: StateClosureSource<T>): IReadableClosure<T> => {
  return isReadableClosure<T>(source) ? source : new SourceReadableClosure({ source });
};

export function mapClosure<const S extends readonly unknown[], R>(
  sources: readonly [...S],
  mapper: StateMapper<StateValues<[...S]>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function mapClosure<S, R>(
  source: S,
  mapper: StateMapper<StateInputValue<S>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function mapClosure<S, R>(
  source: S,
  mapper: StateMapper<StateInputValue<S>, R>,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> {
  return new DerivedReadableClosure(source, () =>
    mapState(
      source,
      (value, prev) => StateClosureHookRuntime.run(null, () => mapper(value, prev)),
      distinctor,
    ),
  );
}

export function selectClosure<const S extends readonly unknown[], R>(
  sources: readonly [...S],
  mapper: (values: StateValues<[...S]>) => R,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function selectClosure<S, R>(
  source: S,
  mapper: (value: StateInputValue<S>) => R,
  distinctor?: Distinctor<R>,
): IReadableClosure<R>;
export function selectClosure<S, R>(
  source: S,
  mapper: (value: StateInputValue<S>) => R,
  distinctor?: Distinctor<R>,
): IReadableClosure<R> {
  return new DerivedReadableClosure(source, () =>
    selectState(
      source,
      (value) => StateClosureHookRuntime.run(null, () => mapper(value)),
      distinctor,
    ),
  );
}

/** Derive field closures from the initial value without taking ownership of the source. */
export const flattenClosure = <T extends object>(
  source: IReadableClosure<T> | IReactiveState<T>,
): FlattenedState<T> => {
  const state = toState(source);

  return mapValues(state.value, (_, key) =>
    mapClosure(state, (value) => value[key as keyof T]),
  ) as FlattenedState<T>;
};

export abstract class BaseStateClosure<T, TInputs = void>
  extends Destructible
  implements IReadableClosure<T>
{
  private _value: IReactiveState<T> | null = null;

  /** Custom writable closures retain a mutable output; internal graphs can own or borrow it. */
  protected get mode(): StateClosureMode {
    return 'mutable';
  }

  readonly inputs: TInputs;

  constructor(inputs: TInputs) {
    super();

    this.inputs = inputs;

    const scope = DescriptorContext.consume();

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
    if (source && this.mode === 'owned') {
      detachWithDescriptorScope(getReadableClosureScope(this), () => {
        (source as OwnedReactiveState<T>).destroy();
      });

      return source;
    }

    if (source && this.mode === 'view' && isNativeStateLike(source)) {
      // Reading the native publication does not set up a ReactiveState. A terminal
      // source is already an immutable handle and needs no extra lifetime boundary.
      if (source instanceof ReactiveState && source.__nativeState.getPublishedState().closed) {
        return source;
      }

      const state = new OwnedStateView(source);

      detachWithDescriptorScope(getReadableClosureScope(this), () => state.destroy());

      return state;
    }

    if (!source) {
      return this.clearable(
        this.mode === 'mutable' ? MutableState.of(initial) : new OwnedValueState(initial),
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

    const subscription = StateContext.run(null, () =>
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

    StateNode.get(state).dependOn(StateNode.get(source));

    return state;
  }

  private setup() {
    if (this._value !== null) {
      return this._value;
    }

    assert(!this.destroyed, 'Cannot set up a destroyed state closure.');

    try {
      const resolvedSource = resolveResult(StateClosureHookRuntime.run(null, () => this.render()));

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

  protected map<const S extends readonly unknown[], R>(
    sources: readonly [...S],
    mapper: StateMapper<StateValues<[...S]>, R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R>;
  protected map<S, R>(
    source: S,
    mapper: StateMapper<StateInputValue<S>, R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R>;
  protected map<S, R>(
    source: S,
    mapper: StateMapper<StateInputValue<S>, R>,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R> {
    return this.own(mapClosure(source, mapper, distinctor));
  }

  protected select<const S extends readonly unknown[], R>(
    sources: readonly [...S],
    mapper: (values: StateValues<[...S]>) => R,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R>;
  protected select<S, R>(
    source: S,
    mapper: (value: StateInputValue<S>) => R,
    distinctor?: Distinctor<R>,
  ): IReadableClosure<R>;
  protected select<S, R>(
    source: S,
    mapper: (value: StateInputValue<S>) => R,
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

  protected combine<const TSources extends [unknown, ...unknown[]]>(
    ...sources: TSources
  ): IReadableClosure<StateValues<TSources>> {
    return this.map<TSources, StateValues<TSources>>(
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

  protected override get mode(): StateClosureMode {
    return 'view';
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

  protected override get mode(): StateClosureMode {
    return 'owned';
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

  protected override get mode(): StateClosureMode {
    return this.inputs.owned ? 'owned' : 'view';
  }

  protected render() {
    const { factory } = this.inputs;

    return factory();
  }
}
