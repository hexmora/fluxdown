import { config } from 'rxjs';

import type { StateNode } from '../state-graph/node';
import type { StateSubscription } from './observe';
import type { StateSubscriber } from './type';

import { notifyStateSubscriber } from '../state-graph/subscriber';

export type StateNotification = 'next' | 'error' | 'complete';

type NotificationFrame<T> = {
  next: StateObserver<T> | null;

  limit: number;

  parent: NotificationFrame<T> | null;
};

export const reportStateError = (error: unknown) => {
  setTimeout(() => {
    if (config.onUnhandledError) {
      config.onUnhandledError(error);

      return;
    }

    throw error;
  });
};

class StateObserver<T> implements StateSubscription {
  previous: StateObserver<T> | null = null;

  next: StateObserver<T> | null = null;

  closed = false;

  constructor(
    private owner: StateObservers<T> | null,
    private subscriber: StateSubscriber<T> | null,
    private context: StateNode | null,
    private disconnect: (() => void) | undefined,
    readonly order: number,
  ) {}

  notify(type: StateNotification, value?: unknown) {
    if (this.closed || !this.subscriber) {
      return;
    }

    try {
      notifyStateSubscriber(this.subscriber, this.context, type, value);
    } catch (error) {
      reportStateError(error);
    } finally {
      if (type !== 'next') {
        this.unsubscribe();
      }
    }
  }

  unsubscribe() {
    if (this.closed) {
      return;
    }

    this.closed = true;

    this.owner?.remove(this);

    this.owner = null;

    this.subscriber = null;

    this.context = null;

    const disconnect = this.disconnect;

    this.disconnect = undefined;

    disconnect?.();
  }
}

/** Intrusive listeners keep mutation-safe delivery without per-listener cleanup arrays. */
export class StateObservers<T> {
  private first: StateObserver<T> | null = null;

  private last: StateObserver<T> | null = null;

  private frame: NotificationFrame<T> | null = null;

  private order = 0;

  add(
    subscriber: StateSubscriber<T>,
    context: StateNode | null,
    disconnect?: () => void,
  ): StateObserver<T> {
    const observer = new StateObserver(this, subscriber, context, disconnect, ++this.order);

    observer.previous = this.last;

    if (this.last) {
      this.last.next = observer;
    } else {
      this.first = observer;
    }

    this.last = observer;

    return observer;
  }

  remove(observer: StateObserver<T>) {
    const { previous, next } = observer;

    if (previous) {
      previous.next = next;
    } else {
      this.first = next;
    }

    if (next) {
      next.previous = previous;
    } else {
      this.last = previous;
    }

    for (let frame = this.frame; frame; frame = frame.parent) {
      if (frame.next === observer) {
        frame.next = next;
      }
    }

    observer.previous = null;

    observer.next = null;
  }

  notify(type: StateNotification, value?: unknown) {
    if (!this.first) {
      return;
    }

    const frame: NotificationFrame<T> = {
      next: this.first,
      limit: this.order,
      parent: this.frame,
    };

    this.frame = frame;

    try {
      while (frame.next && frame.next.order <= frame.limit) {
        const observer = frame.next;

        frame.next = observer.next;

        observer.notify(type, value);
      }
    } finally {
      this.frame = frame.parent;
    }
  }
}
