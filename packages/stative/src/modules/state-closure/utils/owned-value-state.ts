import type { Subscription } from 'rxjs';

import { Observable } from 'rxjs';

import type {
  NativeStateAccess,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../../__internal__';
import type { IReactiveState, StateSubscriber } from '../../reactive-state';

import {
  hasNativeAccessors,
  hasNativeValueAccessor,
  StateContext,
  StateNode,
  StateObservers,
} from '../../__internal__';

/** A descriptor's immediate result remains open until its owner releases it. */
export class OwnedValueState<T> implements IReactiveState<T>, NativeStateAccess<T> {
  private stopped = false;

  private observers: StateObservers<T> | null = null;

  constructor(private readonly current: T) {}

  get __nativeState(): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, OwnedValueState.prototype) ? this : null;
  }

  get __revision() {
    return hasNativeValueAccessor(this, OwnedValueState.prototype) ? 0 : undefined;
  }

  get __fixedStateValue() {
    return true;
  }

  get value(): T {
    return this.current;
  }

  get closed(): boolean {
    return this.stopped;
  }

  getPublishedState(): PublishedState<T> {
    return { value: this.current, closed: this.stopped, failed: false, error: undefined };
  }

  observe(subscriber: StateSubscriber<T>, _options?: ObserveStateOptions): StateSubscription {
    const observers = (this.observers ??= new StateObservers<T>());
    const observer = observers.add(subscriber, StateContext.current);

    observer.notify(this.stopped ? 'complete' : 'next', this.current);

    return observer;
  }

  subscribe(subscriber: StateSubscriber<T>): Subscription {
    return new Observable<T>((observer) => this.observe(observer)).subscribe(subscriber);
  }

  destroy() {
    if (this.stopped) {
      return;
    }

    this.stopped = true;

    StateNode.peek(this)?.destroy();

    this.observers?.notify('complete');

    this.observers = null;
  }
}
