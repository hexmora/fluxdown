import type { Distinctor, IReactiveState, StateMapper, StateSubscriber } from '../type';

import { observeState, StateContext } from '../../__internal__';
import { ReactiveState } from '../main';

export const deriveState = <A, B>(
  source: IReactiveState<A>,
  mapper: StateMapper<A, B>,
  distinctor?: Distinctor<B>,
  ordering = false,
): ReactiveState<B> => {
  const initialSource = source.value;

  const initial = mapper(initialSource, null);

  let prev: [A, B] = [initialSource, initial];

  const state = new ReactiveState({
    initial,
    emitter: (observer) => {
      const subscriber: StateSubscriber<A> = {
        next: (value) => {
          const nextResult = ordering
            ? StateContext.run(StateContext.current, () => mapper(value, prev))
            : mapper(value, prev);

          observer.next(nextResult);

          prev = [value, nextResult];
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      };

      const subscription = observeState(
        source,
        subscriber,
        ordering ? { ordering: true } : undefined,
      );

      return () => {
        subscription.unsubscribe();
      };
    },
    distinctor,
  });

  return state;
};
