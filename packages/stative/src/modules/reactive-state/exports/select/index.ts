import type { Observer, Subscription } from 'rxjs';

import { isArray } from 'lodash-es';
import { Observable } from 'rxjs';

import type {
  NativeStateAccess,
  ObserveStateOptions,
  PublishedState,
  StateSubscription,
} from '../../../__internal__';
import type {
  Distinctor,
  IReactiveState,
  StateInputValue,
  StateSubscriber,
  StateValues,
} from '../../type';

import { toState } from '..';
import {
  getNativeStateAccess,
  hasNativeAccessors,
  hasNativeValueAccessor,
  observeState,
  StateContext,
  StateNode,
} from '../../../__internal__';
import { ReactiveState } from '../../main';
import { clearSubscriptions, deriveState } from '../../utils';
import { getInputRevision, hasRevisions, isValuesEqual } from './utils';

/** Pure projections keep no input subscriptions until their output is observed. */
class SelectedState<T> implements IReactiveState<T>, NativeStateAccess<T> {
  private active: ReactiveState<T> | null = null;

  private snapshot: PublishedState<T> | null = null;

  private destroying = false;

  private initialized = false;

  private current?: T;

  private currentRevision = 0;

  private inputValues: unknown[] | null = null;

  private inputRevisions: number[] | null = null;

  constructor(
    private sources: IReactiveState<unknown>[] | null,
    private mapper: ((values: unknown[]) => T) | null,
    private readonly distinctor: Distinctor<T>,
  ) {}

  get __nativeState(): NativeStateAccess<T> | null {
    return hasNativeAccessors(this, SelectedState.prototype) ? this : null;
  }

  get __revision() {
    return hasNativeValueAccessor(this, SelectedState.prototype) ? this.currentRevision : undefined;
  }

  private evaluate(values: unknown[], revisions: (number | undefined)[]): T {
    if (
      this.inputValues &&
      this.inputRevisions &&
      isValuesEqual(this.inputValues, values) &&
      isValuesEqual(this.inputRevisions, revisions)
    ) {
      return this.current as T;
    }

    const cacheable = hasRevisions(revisions);

    const next = this.mapper!(values);

    if (!this.initialized || !this.distinctor(this.current as T, next)) {
      this.current = next;

      this.currentRevision += 1;
    }

    this.initialized = true;

    this.inputValues = cacheable ? values : null;

    this.inputRevisions = cacheable ? revisions : null;

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

    let values: unknown[];

    const revisions: (number | undefined)[] = [];

    try {
      values = this.sources!.map((source) => {
        const value = source.value;

        revisions.push(getInputRevision(source, value));

        return value;
      });
    } catch (error) {
      if (!this.snapshot) {
        throw error;
      }

      return this.value;
    }

    // Reading an input may synchronously observe or destroy this selected state.
    return this.active || this.snapshot ? this.value : this.evaluate(values, revisions);
  }

  get closed(): boolean {
    if (this.snapshot) {
      return true;
    }

    if (this.active) {
      return this.active.closed;
    }

    let closed: boolean;

    try {
      closed = this.sources!.every((source) => source.closed);
    } catch (error) {
      if (!this.snapshot) {
        throw error;
      }

      return true;
    }

    return this.active || this.snapshot ? this.closed : closed;
  }

  private get storedPublishedState(): PublishedState<T> | null {
    return this.snapshot ?? this.active?.getPublishedState() ?? null;
  }

  getPublishedState(): PublishedState<T> {
    const stored = this.storedPublishedState;

    if (stored) {
      return stored;
    }

    try {
      const revisions: (number | undefined)[] = [];

      const sources = this.sources!.map((source) => {
        const access = getNativeStateAccess(source);

        if (access) {
          const snapshot = access.getPublishedState();

          revisions.push(getInputRevision(source, snapshot.value));

          return snapshot;
        }

        const value = source.value;

        revisions.push(getInputRevision(source, value));

        return { value, closed: source.closed, failed: false, error: undefined };
      });

      const current = this.storedPublishedState;

      if (current) {
        return current;
      }

      const failure = sources.find((source) => source.failed);

      if (failure) {
        throw failure.error;
      }

      return {
        value: this.evaluate(
          sources.map((source) => source.value),
          revisions,
        ),
        closed: sources.every((source) => source.closed),
        failed: false,
        error: undefined,
      };
    } catch (error) {
      return (
        this.storedPublishedState ?? {
          value: this.current as T,
          closed: true,
          failed: true,
          error,
        }
      );
    }
  }

  private createActiveState(
    sources: IReactiveState<unknown>[],
    mapper: (values: unknown[]) => T,
  ): ReactiveState<T> {
    const { distinctor } = this;

    if (sources.length === 0) {
      return ReactiveState.of(mapper([]));
    }

    if (sources.length === 1) {
      return deriveState(sources[0], (value) => mapper([value]), distinctor, true);
    }

    const initial = mapper(sources.map((source) => source.value));

    const state = new ReactiveState<T>({
      initial,
      distinctor,
      emitter: (observer) => {
        const refreshNode = new StateNode();

        const disconnect = StateNode.get(state).dependOn(refreshNode, { ordering: true });

        const subscriptions: StateSubscription[] = [];

        const completed = sources.map(() => false);

        let connecting = true;

        let closed = false;

        let failed = false;

        let failure: unknown;

        const refresh = () => {
          if (closed || state.closed) {
            return;
          }

          if (failed) {
            closed = true;

            observer.error(failure);

            return;
          }

          observer.next(mapper(sources.map((source) => source.value)));

          if (completed.every(Boolean)) {
            closed = true;

            observer.complete();
          }
        };

        const schedule = () => {
          if (!connecting && !closed && !state.closed) {
            refreshNode.schedule(refresh);
          }
        };

        const cleanup = () => {
          closed = true;

          disconnect();

          refreshNode.destroy();

          clearSubscriptions(subscriptions);
        };

        try {
          StateContext.run(refreshNode, () => {
            for (let index = 0; index < sources.length; index++) {
              if (closed || failed || state.closed) {
                break;
              }

              const subscriber: Observer<unknown> = {
                next: schedule,
                error: (error) => {
                  failed = true;

                  failure = error;

                  schedule();
                },
                complete: () => {
                  completed[index] = true;

                  schedule();
                },
              };

              subscriptions.push(observeState(sources[index], subscriber));
            }
          });
        } catch (error) {
          try {
            cleanup();
          } catch {
            // Cleanup attempts every input; keep the original setup failure primary.
          }

          throw error;
        }

        connecting = false;

        schedule();

        return cleanup;
      },
    });

    return state;
  }

  private activate(): ReactiveState<T> | null {
    if (!this.active) {
      let state: ReactiveState<T>;

      try {
        const sources = this.sources!;

        state = this.createActiveState(sources, (values) =>
          this.snapshot
            ? this.value
            : this.evaluate(
                values,
                sources.map((source, index) => getInputRevision(source, values[index])),
              ),
        );
      } catch (error) {
        if (!this.snapshot) {
          throw error;
        }

        return null;
      }

      // Input setup can reenter observe() or destroy() before construction returns.
      // Keep the state established by that inner call instead of orphaning its observers.
      if (this.active || this.snapshot) {
        state.destroy();
      } else {
        StateNode.alias(state, this);

        this.active = state;
      }
    }

    return this.active;
  }

  observe(subscriber: StateSubscriber<T>, options?: ObserveStateOptions): StateSubscription {
    if (!this.snapshot) {
      this.activate();
    }

    if (this.snapshot) {
      const state = ReactiveState.of(this.snapshot.value);

      if (this.snapshot.failed) {
        return new Observable<T>((observer) => observer.error(this.snapshot!.error)).subscribe(
          subscriber,
        );
      }

      return observeState(state, subscriber, options);
    }

    return observeState(this.active!, subscriber, options);
  }

  subscribe(subscriber: StateSubscriber<T>): Subscription {
    return new Observable<T>((observer) => this.observe(observer)).subscribe(subscriber);
  }

  destroy() {
    if (this.snapshot || this.destroying) {
      return;
    }

    this.destroying = true;

    this.snapshot = { ...this.getPublishedState(), closed: true };

    this.initialized = false;

    this.inputValues = null;

    this.inputRevisions = null;

    this.current = undefined;

    try {
      this.active?.destroy();

      StateNode.peek(this)?.destroy();
    } finally {
      this.active = null;

      this.sources = null;

      this.mapper = null;

      this.destroying = false;
    }
  }
}

/** Pure projections evaluate cold reads on demand and publish only changed results when observed. */
export function selectState<const S extends readonly unknown[], R>(
  sources: readonly [...S],
  mapper: (values: StateValues<[...S]>) => R,
  distinctor?: Distinctor<R>,
): IReactiveState<R> & { destroy(): void };
export function selectState<S, R>(
  source: S,
  mapper: (value: StateInputValue<S>) => R,
  distinctor?: Distinctor<R>,
): IReactiveState<R> & { destroy(): void };
export function selectState<S, R>(
  source: S,
  mapper: (value: StateInputValue<S>) => R,
  distinctor: Distinctor<R> = Object.is,
): IReactiveState<R> & { destroy(): void } {
  const multiple = isArray(source);

  const sources = multiple ? source : [source];

  return new SelectedState(
    sources.map(toState),
    (values) => mapper((multiple ? values : values[0]) as StateInputValue<S>),
    distinctor,
  );
}
