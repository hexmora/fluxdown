import { isFunction } from 'lodash-es';

import type { StateSubscriber } from '../reactive-state/type';
import type { StateNode } from './node';

import { withStateContext } from './context';

export const notifyStateSubscriber = <T>(
  subscriber: StateSubscriber<T>,
  context: StateNode | null,
  type: 'next' | 'error' | 'complete',
  value?: unknown,
) => {
  withStateContext(context, () => {
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
    return (value) => withStateContext(context, () => subscriber(value));
  }

  return {
    next: subscriber.next
      ? (value) => withStateContext(context, () => subscriber.next?.(value))
      : undefined,
    error: subscriber.error
      ? (error) => withStateContext(context, () => subscriber.error?.(error))
      : undefined,
    complete: subscriber.complete
      ? () => withStateContext(context, () => subscriber.complete?.())
      : undefined,
  };
};
