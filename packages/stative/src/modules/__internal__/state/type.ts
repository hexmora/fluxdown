import type { Observer, Subscription, TeardownLogic } from 'rxjs';

export type NextFunction<T> = (value: T) => void;

export type EmitterFunction<T> = (observer: Observer<T>) => TeardownLogic;

export type Distinctor<T> = (from: T, to: T) => boolean;

export type StateSubscriber<T> = NextFunction<T> | Partial<Observer<T>>;

export type IReactiveState<T> = {
  readonly value: T;

  readonly closed: boolean;

  subscribe(subscriber: StateSubscriber<T>): Subscription;
};

export type DestroyableLike = {
  destroy(): void;
};

export interface StateClosureLike<T> extends DestroyableLike {
  readonly value: IReactiveState<T>;
}

export type StateSubscription = {
  readonly closed: boolean;

  unsubscribe(): void;
};

export type ObserveStateOptions = { ordering?: boolean };

export type PublishedState<T> = {
  value: T;

  closed: boolean;

  failed: boolean;

  error: unknown;
};

export type NativeStateAccess<T> = {
  observe(subscriber: StateSubscriber<T>, options?: ObserveStateOptions): StateSubscription;

  getPublishedState(): PublishedState<T>;
};

export interface NativeStateLike<T> extends IReactiveState<T> {
  readonly __nativeState: NativeStateAccess<T>;
}

export type FixedStateValueLike = {
  readonly __fixedStateValue: true;
};
