import { Observable, type Subscription } from 'rxjs';

import type { IReactiveState, StateSubscriber } from '../../reactive-state';
import type {
  NativeState,
  NativeStateAccess,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../../reactive-state/observe';

import { hasNativeAccessors, nativeState, observeState } from '../../reactive-state/observe';
import { StateObservers } from '../../reactive-state/observers';
import {
  getStateContext,
  getStateContextOptions,
  withStateContext,
} from '../../state-graph/context';
import { aliasStateNode, getStateNode } from '../../state-graph/node';
import { fixedStateValue, hasFixedStateValue } from './owned-value-state';

/**
 * A lifetime boundary over a native state, without another publication or graph node.
 * Live reads follow the source. Detaching freezes its last published value and terminates
 * this view's observers without terminating the borrowed source.
 */
export class OwnedStateView<T> implements IReactiveState<T>, NativeStateAccess<T> {
  private source: NativeState<T> | null;

  private access: NativeStateAccess<T> | null;

  private snapshot: PublishedState<T> | null = null;

  private observers: StateObservers<T> | null = null;

  private connection: StateSubscription | null = null;

  private observerCount = 0;

  constructor(source: NativeState<T>) {
    this.source = source;

    this.access = source[nativeState];

    if (!hasFixedStateValue(source)) {
      aliasStateNode(this, source);
    }
  }

  get [nativeState](): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, OwnedStateView.prototype) ? this : null;
  }

  get [fixedStateValue](): boolean {
    return !this.source || hasFixedStateValue(this.source);
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
    const context = getStateContext();
    const currentOptions = options ?? getStateContextOptions();
    const observers = (this.observers ??= new StateObservers<T>());
    const disconnect =
      source && !hasFixedStateValue(source) && !this.access!.getPublishedState().closed
        ? context?.dependOn(getStateNode(source), currentOptions)
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
      const connection = withStateContext(null, () =>
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

    this.source = null;

    this.access = null;

    try {
      this.connection?.unsubscribe();
    } finally {
      this.connection = null;

      this.observers?.notify(this.snapshot.failed ? 'error' : 'complete', this.snapshot.error);

      this.observers = null;
    }
  }
}
