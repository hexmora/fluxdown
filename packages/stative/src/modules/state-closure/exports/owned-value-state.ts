import { Observable, type Subscription } from 'rxjs';

import type { IReactiveState, StateSubscriber } from '../../reactive-state';
import type {
  NativeStateAccess,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../../reactive-state/observe';

import { hasNativeAccessors, nativeState } from '../../reactive-state/observe';
import { StateObservers } from '../../reactive-state/observers';
import { getStateContext } from '../../state-graph/context';
import { peekStateNode } from '../../state-graph/node';

/** Internal marker: only the lifetime may change, so value dependencies need no graph edge. */
export const fixedStateValue = /*#__PURE__*/ Symbol('stative.fixed-value');

export const hasFixedStateValue = (state: object): boolean =>
  fixedStateValue in state && !!(state as { [fixedStateValue]: boolean })[fixedStateValue];

/** A descriptor's immediate result remains open until its owner releases it. */
export class OwnedValueState<T> implements IReactiveState<T>, NativeStateAccess<T> {
  private stopped = false;

  private observers: StateObservers<T> | null = null;

  constructor(private readonly current: T) {}

  get [nativeState](): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, OwnedValueState.prototype) ? this : null;
  }

  get [fixedStateValue]() {
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
    const observer = observers.add(subscriber, getStateContext());

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

    peekStateNode(this)?.destroy();

    this.observers?.notify('complete');

    this.observers = null;
  }
}
