import { Observable, type Subscription } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type {
  NativeStateAccess,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../observe';
import type { Distinctor, IReactiveState, StateSubscriber, StateValues } from '../type';

import { aliasStateNode, peekStateNode } from '../../state-graph/node';
import {
  hasNativeAccessors,
  isNativeState,
  nativeState,
  observeState,
  readPublishedState,
} from '../observe';
import { ReactiveState } from './base';
import { combineMapState, toState } from './operator';

type ComputedSources<T extends readonly unknown[]> = {
  [K in keyof T]: IReactiveState<T[K]>;
};

/** Pure projections keep no input subscriptions until their output is observed. */
class ComputedState<TValues extends [unknown, ...unknown[]], T>
  implements IReactiveState<T>, NativeStateAccess<T>
{
  private active: ReactiveState<T> | null = null;

  private snapshot: PublishedState<T> | null = null;

  private values: TValues | null = null;

  private current?: T;

  constructor(
    private sources: ComputedSources<TValues> | null,
    private mapper: ((values: TValues) => T) | null,
    private readonly distinctor: Distinctor<T>,
  ) {}

  get [nativeState](): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, ComputedState.prototype) ? this : null;
  }

  private evaluate(values: TValues): T {
    if (this.values && shallowEqual(this.values, values)) {
      return this.current as T;
    }

    const next = this.mapper!(values);

    if (!this.values || !this.distinctor(this.current as T, next)) {
      this.current = next;
    }

    this.values = values;

    return this.current as T;
  }

  get value(): T {
    if (this.snapshot) {
      if (this.snapshot.failed) {
        throw this.snapshot.error;
      }

      return this.snapshot.value;
    }

    if (this.active) {
      return this.active.value;
    }

    return this.evaluate(this.sources!.map((source) => source.value) as TValues);
  }

  get closed(): boolean {
    return (
      !!this.snapshot || (this.active?.closed ?? this.sources!.every((source) => source.closed))
    );
  }

  getPublishedState(): PublishedState<T> {
    if (this.snapshot) {
      return this.snapshot;
    }

    if (this.active) {
      return this.active.getPublishedState();
    }

    try {
      const sources = this.sources!.map((source) => {
        if (isNativeState(source)) {
          return readPublishedState(source);
        }

        return { value: source.value, closed: source.closed, failed: false, error: undefined };
      });

      const failure = sources.find((source) => source.failed);

      if (failure) {
        throw failure.error;
      }

      return {
        value: this.evaluate(sources.map((source) => source.value) as TValues),
        closed: sources.every((source) => source.closed),
        failed: false,
        error: undefined,
      };
    } catch (error) {
      return { value: this.current as T, closed: true, failed: true, error };
    }
  }

  private activate(): ReactiveState<T> {
    if (!this.active) {
      const state = combineMapState(
        this.sources!,
        (values) => this.evaluate(values as TValues),
        this.distinctor,
      );

      aliasStateNode(state, this);

      this.active = state;
    }

    return this.active;
  }

  observe(subscriber: StateSubscriber<T>, options?: ObserveStateOptions): StateSubscription {
    if (this.snapshot) {
      const state = ReactiveState.of(this.snapshot.value);

      if (this.snapshot.failed) {
        return new Observable<T>((observer) => observer.error(this.snapshot!.error)).subscribe(
          subscriber,
        );
      }

      return observeState(state, subscriber, options);
    }

    return observeState(this.activate(), subscriber, options);
  }

  subscribe(subscriber: StateSubscriber<T>): Subscription {
    return new Observable<T>((observer) => this.observe(observer)).subscribe(subscriber);
  }

  destroy() {
    if (this.snapshot) {
      return;
    }

    this.snapshot = { ...this.getPublishedState(), closed: true };

    this.values = null;

    this.current = undefined;

    try {
      this.active?.destroy();

      peekStateNode(this)?.destroy();
    } finally {
      this.active = null;

      this.sources = null;

      this.mapper = null;
    }
  }
}

/** The mapper must be pure: unobserved intermediate values may never be evaluated. */
export const computedState = <const TSources extends [unknown, ...unknown[]], T>(
  sources: [...TSources],
  mapper: (values: StateValues<TSources>) => T,
  distinctor: Distinctor<T> = Object.is,
): IReactiveState<T> & { destroy(): void } => {
  return new ComputedState(
    sources.map(toState) as ComputedSources<StateValues<TSources>>,
    mapper,
    distinctor,
  );
};
