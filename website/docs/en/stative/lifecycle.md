# Lifecycle

A state flow should live as long as the feature using it. Stative cleans up the children managed by a closure, and external resources can share that lifecycle.

## Clean up what you create

The caller is responsible for destroying a root closure created with `render`. Children created and managed through nested descriptors, `useCreate`, `useMap`, and similar helpers are cleaned up with it.

```ts
import { MutableState, render, S } from 'stative';

type LengthInputs = {
  text: string;
};

const Length = ({ text }: LengthInputs) => text.length;

const text = MutableState.of('Hello');
const length = render(S([Length, { text }]));
const subscription = length.value.subscribe((value) => console.log(value));

// When the feature finishes
subscription.unsubscribe();
length.destroy();
text.destroy();
```

Unsubscribing and destroying a closure serve different purposes. `unsubscribe()` stops notifications for that subscription; `destroy()` ends the closure's lifetime and releases its internal dependencies.

An external state passed as an input, such as `text`, is not destroyed with the root closure. It may be shared with other features, so the code that created it should decide when to clean it up.

## Manage timers and event sources

`ReactiveState` can turn external events into a state with a current value. Supply `initial`, publish updates from `emitter`, and return a cleanup function:

```ts
import { once, ReactiveState, render, S, useClearable } from 'stative';

const Clock = once(() =>
  useClearable(
    new ReactiveState({
      initial: Date.now(),
      emitter: (observer) => {
        const timer = setInterval(() => observer.next(Date.now()), 1000);

        return () => clearInterval(timer);
      },
    }),
  ),
);

const clock = render(S([Clock, {}]));
const subscription = clock.value.subscribe((time) => console.log(time));

// When the page closes or the feature finishes
subscription.unsubscribe();
clock.destroy();
```

`useClearable` registers the state as a resource owned by the closure. Destroying `clock` destroys the state, which runs the emitter's cleanup and stops the timer.

By default, `emitter` starts when the state is first accessed or subscribed to. Canceling one subscription does not destroy that state; call `destroy()` on its owning closure when it is no longer needed.

Use the same pattern for event listeners and other sources: establish the connection, call `observer.next(value)` for updates, and return a function that disconnects it.

## Register other cleanup work

Inside `once`, you can also pass a cleanup function directly to `useClearable`:

```ts
import { D, once, useClearable } from 'stative';

const Session = once(() => {
  const controller = new AbortController();

  useClearable(() => controller.abort());

  return D(controller.signal);
});
```

The function runs when the closure is destroyed. `useClearable` also accepts cancellable subscriptions and objects with a `destroy()` method. In a class, use `this.clearable(...)`.

## Completion and errors

An external source can call `observer.complete()` to finish or `observer.error(error)` to report a failure. A subscription can handle each case:

```ts
import { MutableState } from 'stative';

const state = MutableState.of('Preparing');
const subscription = state.subscribe({
  next: (value) => console.log(value),
  error: (error) => console.error('State update failed', error),
  complete: () => console.log('State flow completed'),
});

state.next('Done');
state.complete();
subscription.unsubscribe();
```

`MutableState` provides matching `complete()` and `error()` methods. A completed or failed state no longer accepts updates. If the feature supports retries, it is often more useful to represent loading results and errors as ordinary state values, then let the application decide what happens next.
