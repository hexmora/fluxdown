import type {
  IReactiveState,
  ObserveStateOptions,
  StateSubscriber,
  StateSubscription,
} from './type';

import { StateContext } from '../state-graph';
import { getNativeStateAccess } from './predicates';

/** Internal edges do not need an RxJS subscriber or observable adapter. */
export const observeState = <T>(
  state: IReactiveState<T>,
  subscriber: StateSubscriber<T>,
  options?: ObserveStateOptions,
): StateSubscription => {
  const access = getNativeStateAccess(state);

  if (access) {
    return access.observe(subscriber, options);
  }

  return options
    ? StateContext.run(StateContext.current, () => state.subscribe(subscriber), options)
    : state.subscribe(subscriber);
};
