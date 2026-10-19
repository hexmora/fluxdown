import { last, sumBy } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { once, ReactiveState, useClearable, useMap, useSwitchMap } from 'stative';

import type { ShadPosition, ShadProgressInputs } from './type';

import { SHAD_AUTO_HIDE_TIMEOUT } from './consts';

export * from './type';

export const ShadProgress = /*#__PURE__*/ once(function ShadProgress({
  source,
  enabled: _enabled,
  length: _length,
  hideDelay: _hideDelay,
}: ShadProgressInputs) {
  const emptyLength = ReactiveState.of(0);

  const tailLength = useSwitchMap(source, (blocks) => last(blocks)?.length ?? emptyLength);

  const visibleLength = useMap([source, tailLength], ([blocks]) =>
    sumBy(blocks, (block) => block.length.value),
  );

  const configuration = useMap(
    [visibleLength, _enabled, _length, _hideDelay],
    ([total, enabled, length, hideDelay]) => ({
      total,
      length: enabled && Number.isFinite(length) ? Math.max(0, Math.floor(length)) : 0,
      hideDelay: Number.isFinite(hideDelay) ? Math.max(0, hideDelay) : SHAD_AUTO_HIDE_TIMEOUT,
    }),
    shallowEqual,
  );

  const input = configuration.value;

  const state = useClearable(
    new ReactiveState<ShadPosition>({
      initial: { length: input.value.length, activeLength: 0 },
      distinctor: shallowEqual,

      emitter: (observer) => {
        let previousTotal = input.value.total;

        let committed = previousTotal;

        let timeout: ReturnType<typeof setTimeout> | null = null;

        const clearTimeoutHandle = () => {
          if (timeout !== null) {
            clearTimeout(timeout);

            timeout = null;
          }
        };

        const publish = () => {
          const { total, length } = input.value;

          if (timeout === null || length <= 0) {
            committed = total;
          }

          observer.next({
            length,
            activeLength: timeout === null ? 0 : Math.min(length, Math.max(0, total - committed)),
          });

          if (input.closed && timeout === null) {
            observer.complete();
          }
        };

        const subscription = input.subscribe({
          next: ({ total, length, hideDelay }) => {
            if (length <= 0) {
              clearTimeoutHandle();
            } else if (total > previousTotal) {
              clearTimeoutHandle();

              timeout = setTimeout(() => {
                timeout = null;

                publish();
              }, hideDelay);
            }

            committed = Math.min(committed, total);

            previousTotal = total;

            publish();
          },

          complete: publish,

          error: (error) => observer.error(error),
        });

        return () => {
          clearTimeoutHandle();

          subscription.unsubscribe();
        };
      },
    }),
  );

  return state;
});
