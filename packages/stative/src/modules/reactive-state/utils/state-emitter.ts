import type { Observer } from 'rxjs';

import type { ReactiveState } from '../main';

import { reportStateError } from '../../__internal__';

export type PendingType = 'next' | 'complete' | 'error';

export class StateEmitter<T> implements Observer<T> {
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
