# Meet Stative

**Organize state flows into modules, just as React organizes the DOM.**

Stative is a reactive state library, independent of any UI framework. Describe how your computations depend on their inputs, and the results follow those inputs as they change.

Use it to break connected data processing into small, reusable pieces: price calculations in a form, content analysis in an editor, or a streaming text pipeline. Fluxdown Core is built on Stative.

## Treat computations as reusable units

A **state closure** brings together a computation, its inputs, and the child computations it creates. It provides both a current result and notifications when that result changes.

```ts
import { MutableState, render, S } from 'stative';

type DoubleInputs = {
  value: number;
};

const Double = ({ value }: DoubleInputs) => value * 2;

const count = MutableState.of(2);
const doubled = render(S([Double, { value: count }]));

console.log(doubled.value.value); // 4

count.next(3);
console.log(doubled.value.value); // 6

doubled.destroy();
count.destroy();
```

`Double` only describes the calculation. `S` connects it to its inputs, and `render` creates the state closure. Here, `render` does not render a UI or require a browser.

## Three core concepts

| Concept                | Responsibility                                                        | Common entry point |
| ---------------------- | --------------------------------------------------------------------- | ------------------ |
| State                  | Holds a current value and notifies subscribers of changes             | `MutableState`     |
| Computation descriptor | Declares a computation and its inputs; can be nested                  | `S` or JSX         |
| State closure          | Runs the computation, exposes its result, and manages child lifetimes | `render`           |

Start with a plain function for simple calculations. Use `once` or a class when you need to connect computations or manage local resources. All three forms can be composed together.

## Learn as you go

- [Getting started](./getting-started): create, observe, and update your first state flow.
- [State and derived values](./state-and-derived): combine inputs, batch updates, and skip repeated work.
- [Composing computations](./composition): package a state flow into a reusable closure.
- [Lifecycle](./lifecycle): clean up subscriptions, timers, and child computations together.

Stative does not depend on a UI framework. Its optional [JSX syntax](./jsx) uses its own runtime and does not require React. If you only need to display streaming Markdown in an application, start with [Fluxdown React](../fluxdown/react/quick-start).
