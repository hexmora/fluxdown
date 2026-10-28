import { createEffect, createMemo, ErrorBoundary, on, Show, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { SlotRendererProps } from './type';

import { SlotsContext } from '../../context';
import { createSlotComposer } from '../../utils/compose';

export * from './type';

export const SlotRenderer = (props: SlotRendererProps) => {
  const slots = useContext(SlotsContext);

  if (!slots) {
    throw new Error(`The ${props.type} slot requires a Fluxdown SlotProvider.`);
  }

  const compose = createSlotComposer();

  const Component = createMemo(() => compose(slots()[props.type] ?? []));

  const Wrapper = createMemo(() => compose(slots().Wrapper ?? []));

  const Fallback = createMemo(() => compose(slots().Fallback ?? []));

  if (props.type === 'Fallback' || props.type === 'Wrapper') {
    return <Dynamic component={Component() ?? undefined} {...props.props} />;
  }

  return (
    <ErrorBoundary
      fallback={(error, reset) => {
        createEffect(on([Component, Wrapper, Fallback, () => props.props], reset, { defer: true }));

        return (
          <Dynamic
            component={Fallback() ?? undefined}
            type={props.type}
            props={props.props}
            error={error}
            onReset={reset}
          />
        );
      }}
    >
      <Show when={Component()}>
        <Show
          when={Wrapper()}
          fallback={<Dynamic component={Component() ?? undefined} {...props.props} />}
        >
          <Dynamic component={Wrapper() ?? undefined} props={props.props} type={props.type}>
            <Dynamic component={Component() ?? undefined} {...props.props} />
          </Dynamic>
        </Show>
      </Show>
    </ErrorBoundary>
  );
};
