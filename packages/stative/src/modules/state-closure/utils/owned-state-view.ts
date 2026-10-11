import type { Subscription } from 'rxjs';

import { Observable } from 'rxjs';

import type {
  NativeStateAccess,
  NativeStateLike,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../../__internal__';
import type { IReactiveState, StateSubscriber } from '../../reactive-state';

import {
  getStateRevision,
  hasNativeAccessors,
  hasNativeValueAccessor,
  isFixedStateValueLike,
  observeState,
  StateContext,
  StateNode,
  StateObservers,
} from '../../__internal__';

/**
 * A lifetime boundary over a native state, without another publication or graph node.
 * Live reads follow the source. Detaching freezes its last published value and terminates
 * this view's observers without terminating the borrowed source.
 */
export class OwnedStateView<T> implements IReactiveState<T>, NativeStateAccess<T> {
  private source: NativeStateLike<T> | null;

  private access: NativeStateAccess<T> | null;

  private snapshot: PublishedState<T> | null = null;

  private frozenRevision?: number;

  private observers: StateObservers<T> | null = null;

  private connection: StateSubscription | null = null;

  private observerCount = 0;

  constructor(source: NativeStateLike<T>) {
    this.source = source;

    this.access = source.__nativeState;

    if (!isFixedStateValueLike(source)) {
      StateNode.alias(this, source);
    }
  }

  get __nativeState(): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, OwnedStateView.prototype) ? this : null;
  }

  get __revision(): number | undefined {
    if (!hasNativeValueAccessor(this, OwnedStateView.prototype)) {
      return undefined;
    }

    if (!this.source) {
      return this.frozenRevision;
    }

    return getStateRevision(this.source);
  }

  get __fixedStateValue(): boolean {
    return !this.source || isFixedStateValueLike(this.source);
  }

  get value(): T {
    if (this.source) {
      return this.source.value;
    }

    const snapshot = this.snapshot!;

    if (snapshot.failed) {
      throw snapshot.error;
    }

    return snapshot.value;
  }

  get closed(): boolean {
    return this.source ? this.source.closed : true;
  }

  getPublishedState(): PublishedState<T> {
    return this.access ? this.access.getPublishedState() : this.snapshot!;
  }

  subscribe(subscriber: StateSubscriber<T>): Subscription {
    return new Observable<T>((observer) => this.observe(observer)).subscribe(subscriber);
  }

  observe(subscriber: StateSubscriber<T>, options?: ObserveStateOptions): StateSubscription {
    const source = this.source;
    const context = StateContext.current;
    const currentOptions = options ?? StateContext.options;
    const observers = (this.observers ??= new StateObservers<T>());
    const disconnect =
      source && !isFixedStateValueLike(source) && !this.access!.getPublishedState().closed
        ? context?.dependOn(StateNode.get(source), currentOptions)
        : undefined;

    this.observerCount += 1;

    const observer = observers.add(subscriber, context, () => {
      disconnect?.();

      this.observerCount -= 1;

      if (this.observerCount === 0) {
        this.connection?.unsubscribe();

        this.connection = null;

        this.observers = null;
      }
    });

    if (!source) {
      const snapshot = this.snapshot!;

      observer.notify(snapshot.failed ? 'error' : 'complete', snapshot.error);

      return observer;
    }

    if (this.observerCount > 1) {
      const snapshot = this.access!.getPublishedState();

      if (snapshot.closed) {
        observer.notify(snapshot.failed ? 'error' : 'complete', snapshot.error);
      } else {
        observer.notify('next', snapshot.value);
      }

      return observer;
    }

    try {
      const connection = StateContext.run(null, () =>
        observeState(source, {
          next: (value) => this.observers?.notify('next', value),
          error: (error) => this.observers?.notify('error', error),
          complete: () => this.observers?.notify('complete'),
        }),
      );

      if (this.observerCount === 0) {
        connection.unsubscribe();
      } else {
        this.connection = connection;
      }
    } catch (error) {
      observer.unsubscribe();

      throw error;
    }

    return observer;
  }

  destroy() {
    if (!this.source) {
      return;
    }

    this.snapshot = { ...this.access!.getPublishedState(), closed: true };

    this.frozenRevision = this.__revision;

    this.source = null;

    this.access = null;

    StateNode.clearAlias(this);

    try {
      this.connection?.unsubscribe();
    } finally {
      this.connection = null;

      this.observers?.notify(this.snapshot.failed ? 'error' : 'complete', this.snapshot.error);

      this.observers = null;
    }
  }
}
