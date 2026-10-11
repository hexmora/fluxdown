import { UnsubscriptionError } from 'rxjs';

import type { StateSubscription } from '../../__internal__';

/** Release every input even when an external subscription fails to clean up. */
export const clearSubscriptions = (subscriptions: StateSubscription[]) => {
  let errors: unknown[] | undefined;

  for (const subscription of subscriptions) {
    try {
      subscription.unsubscribe();
    } catch (error) {
      errors ??= [];

      errors.push(...(error instanceof UnsubscriptionError ? error.errors : [error]));
    }
  }

  subscriptions.length = 0;

  if (errors) {
    throw new UnsubscriptionError(errors);
  }
};
