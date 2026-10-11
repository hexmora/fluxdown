import { isFunction } from 'lodash-es';

import type { StateSubscriber } from '../state';
import type { StateNode } from './node';

import { StateContext } from './context';

export const notifyStateSubscriber = <T>(
  subscriber: StateSubscriber<T>,
  context: StateNode | null,
  type: 'next' | 'error' | 'complete',
  value?: unknown,
) => {
  StateContext.run(context, () => {
    if (isFunction(subscriber)) {
      if (type === 'next') {
        subscriber(value as T);
      } else if (type === 'error') {
        throw value;
      }

      return;
    }

    if (type === 'next') {
      subscriber.next?.(value as T);
    } else if (type === 'complete') {
      subscriber.complete?.();
    } else if (subscriber.error) {
      subscriber.error(value);
    } else {
      throw value;
    }
  });
};

/** Keep dynamic subscriptions attached to their emitter, never to the publishing source. */
export const bindStateSubscriber = <T>(
  subscriber: StateSubscriber<T>,
  context: StateNode | null,
): StateSubscriber<T> => {
  if (isFunction(subscriber)) {
    return (value) => StateContext.run(context, () => subscriber(value));
  }

  return {
    next: subscriber.next
      ? (value) => StateContext.run(context, () => subscriber.next?.(value))
      : undefined,
    error: subscriber.error
      ? (error) => StateContext.run(context, () => subscriber.error?.(error))
      : undefined,
    complete: subscriber.complete
      ? () => StateContext.run(context, () => subscriber.complete?.())
      : undefined,
  };
};
