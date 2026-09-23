import { isFunction } from 'lodash-es';

import type { StateSubscriber } from '../reactive-state/type';
import type { StateNode } from './node';

import { withStateContext } from './context';

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
