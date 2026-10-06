import { isFunction, noop } from 'lodash-es';
import { Observable, type Observer, type Subscription, type TeardownLogic } from 'rxjs';

import type {
  NativeStateAccess,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../observe';
import type {
  Distinctor,
  EmitterFunction,
  IReactiveState,
  ReactiveStateParams,
  StateSubscriber,
} from '../type';

import { Destructible } from '../../destructible';
import { canSettle } from '../../state-graph/batch';
import {
  getStateContext,
  getStateContextOptions,
  withStateContext,
} from '../../state-graph/context';
import { getStateNode, peekStateNode, type StateNode } from '../../state-graph/node';
import { hasNativeAccessors, nativeState } from '../observe';
import { reportStateError, StateObservers } from '../observers';
import { isFinalPendingType } from '../utils';

type PendingType = 'next' | 'complete' | 'error';

class StateEmitter<T> implements Observer<T> {
  constructor(private state: ReactiveState<T> | null) {}

  private emit(type: PendingType, value?: unknown) {
    const { state } = this;

    if (!state) {
      return;
    }

    if (type !== 'next') {
      this.state = null;
    }

    try {
      state.receive(type, value);
    } catch (error) {
      reportStateError(error);
    }
  }

  next(value: T) {
    this.emit('next', value);
  }

  error(error: unknown) {
    this.emit('error', error);
  }

  complete() {
    this.emit('complete');
  }

  unsubscribe() {
    this.state = null;
  }
}

export class ReactiveState<T> extends Destructible implements IReactiveState<T> {
  private stateNode: StateNode | null = null;

  private observers: StateObservers<T> | null = null;

  private current: T;

  private stopped: boolean;

  private failed = false;

  private failure: unknown;

  private readonly distinctor: Distinctor<T>;

  private emitter?: EmitterFunction<T>;

  private emitterObserver: StateEmitter<T> | null = null;

  private emitterTeardown: TeardownLogic = undefined;

  private isSetup: boolean;

  private pendingType: PendingType | null = null;

  private hasPendingValue = false;

  private pendingValue?: T;

  private pendingError: unknown;

  private publishPending?: () => void;

  static of<T>(value: T): ReactiveState<T> {
    return new ReactiveState({ initial: value });
  }

  constructor({ initial, emitter, distinctor = Object.is, lazy = true }: ReactiveStateParams<T>) {
    super();

    this.current = initial;

    this.distinctor = distinctor;

    this.stopped = !emitter;

    this.isSetup = !emitter || emitter === noop;

    this.emitter = emitter === noop ? undefined : emitter;

    if (!lazy) {
      this.setup();
    }
  }

  get [nativeState](): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, ReactiveState.prototype) ? this : null;
  }

  private get node() {
    return (this.stateNode ??= getStateNode(this));
  }

  private get existingNode() {
    return (this.stateNode ??= peekStateNode(this) ?? null);
  }

  private flushPendingUpdate() {
    const type = this.pendingType;

    const hasValue = this.hasPendingValue;

    const value = this.pendingValue as T;

    const error = this.pendingError;

    this.clearPendingValue();

    if (!type || this.stopped) {
      return;
    }

    try {
      if (hasValue && !this.distinctor(this.current, value)) {
        this.current = value;

        this.observers?.notify('next', value);
      }
    } finally {
      if (isFinalPendingType(type)) {
        this.stopped = true;

        this.failed = type === 'error';

        this.failure = error;

        try {
          this.observers?.notify(type, error);
        } finally {
          this.existingNode?.destroy();

          try {
            this.teardown();
          } finally {
            super.destroy();
          }
        }
      }
    }
  }

  private setPendingValue(type: PendingType, payload?: unknown) {
    if (isFinalPendingType(this.pendingType)) {
      return;
    }

    if (type === 'next') {
      this.hasPendingValue = true;

      this.pendingValue = payload as T;
    } else if (type === 'error') {
      this.pendingError = payload;
    }

    this.pendingType = type;

    this.publishPending ??= this.flushPendingUpdate.bind(this);

    this.node.schedule(this.publishPending);
  }

  private clearPendingValue() {
    this.pendingType = null;

    this.hasPendingValue = false;

    this.pendingValue = undefined;

    this.pendingError = undefined;
  }

  private setup() {
    if (this.isSetup) {
      return;
    }

    this.isSetup = true;

    const { emitter } = this;

    this.emitter = undefined;

    if (!emitter || this.stopped) {
      return;
    }

    const observer = new StateEmitter(this);

    this.emitterObserver = observer;

    let teardown: TeardownLogic = undefined;

    try {
      teardown = withStateContext(this.node, () => emitter(observer));
    } catch (error) {
      observer.error(error);
    }

    if (this.stopped) {
      this.disposeEmitter(teardown);
    } else {
      this.emitterTeardown = teardown;
    }
  }

  private get rawClosed() {
    return isFinalPendingType(this.pendingType) || this.stopped;
  }

  private get rawValue() {
    if (this.hasPendingValue) {
      return this.pendingValue as T;
    }

    if (this.failed) {
      throw this.failure;
    }

    return this.current;
  }

  get value() {
    this.setup();

    if (canSettle()) {
      this.existingNode?.settle();
    }

    return this.rawValue;
  }

  get closed() {
    this.setup();

    return this.rawClosed;
  }

  getPublishedState(): PublishedState<T> {
    return {
      value: this.current,
      closed: this.stopped,
      failed: this.failed,
      error: this.failure,
    };
  }

  observe(subscriber: StateSubscriber<T>, options?: ObserveStateOptions): StateSubscription {
    const context = getStateContext();

    this.setup();

    const disconnect = this.stopped
      ? undefined
      : context?.dependOn(this.node, options ?? getStateContextOptions());

    this.observers ??= new StateObservers();

    const observer = this.observers.add(subscriber, context, disconnect);

    if (this.failed) {
      observer.notify('error', this.failure);
    } else if (this.stopped) {
      observer.notify('complete');
    } else {
      observer.notify('next', this.current);
    }

    return observer;
  }

  subscribe(subscriber: StateSubscriber<T>): Subscription {
    return new Observable<T>((observer) => this.observe(observer)).subscribe(subscriber);
  }

  /** Shared emitter entry keeps per-state bound observer callbacks out of the graph. */
  receive(type: PendingType, value?: unknown) {
    if (type === 'next') {
      this._next(value as T);
    } else if (type === 'error') {
      this._error(value);
    } else {
      this._complete();
    }
  }

  protected _next(value: T) {
    this.setup();

    if (this.rawClosed || this.distinctor(this.rawValue, value)) {
      return;
    }

    this.setPendingValue('next', value);
  }

  protected _error(error: unknown) {
    this.setup();

    if (!this.rawClosed) {
      this.setPendingValue('error', error);
    }
  }

  protected _complete() {
    this.setup();

    if (!this.rawClosed) {
      this.setPendingValue('complete');
    }
  }

  private disposeEmitter(teardown: TeardownLogic) {
    if (isFunction(teardown)) {
      teardown();
    } else {
      teardown?.unsubscribe();
    }
  }

  private teardown() {
    this.emitterObserver?.unsubscribe();

    this.emitterObserver = null;

    const teardown = this.emitterTeardown;

    this.emitterTeardown = undefined;

    this.disposeEmitter(teardown);
  }

  override destroy() {
    if (this.destroyed) {
      return;
    }

    this.clearPendingValue();

    this.existingNode?.destroy();

    this.stopped = true;

    try {
      this.teardown();
    } finally {
      this.observers?.notify('complete');

      super.destroy();
    }
  }
}
