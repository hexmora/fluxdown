# stative

Composable reactive state, independent of a UI framework.

[Documentation](../../website/docs/en/stative/index.md) · [简体中文](./docs/README.zh-CN.md)

Stative connects changing inputs to reusable computations. Each computation exposes a current result and notifies subscribers when it changes. Compose these computations into larger state flows with their own lifecycles.

Use it for derived form values, editor analysis, and streaming pipelines. Stative powers [Fluxdown Core](../core) and works in browsers and Node.js.

## Install

```sh
pnpm add stative
```

## Create a state flow

```ts
import { MutableState, render, S } from "stative";

type TotalInputs = {
  price: number;
  quantity: number;
};

const Total = ({ price, quantity }: TotalInputs) => price * quantity;

const quantity = MutableState.of(2);
const total = render(S([Total, { price: 20, quantity }]));
const subscription = total.value.subscribe((amount) => console.log(amount));
// Logs 40 immediately.

quantity.next(3); // Logs 60.
console.log(total.value.value); // 60

// Run when this state flow is no longer needed.
subscription.unsubscribe();
total.destroy();
quantity.destroy();
```

`MutableState` holds an input. `S` describes a computation and its inputs; `render` creates a **state closure** that runs it and manages its children. The computation initializes when its output is first accessed. `total.value` is the subscribable result state, and `total.value.value` is its current value.

`Total` receives ordinary numbers, whether its inputs are constants or changing states. Destroying its closure releases the managed children and internal subscriptions. The `quantity` state was created outside the closure and needs its own cleanup.

## Compose as your state flow grows

Choose the form that fits the computation. All three work with `S` and `render`:

| Form                     | Use it for                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Plain function           | Calculate a result from the current input values.                                                |
| `once`                   | Connect child computations and resources once, then let the resulting state flow handle updates. |
| `BaseStateClosure` class | Organize a state flow with instance methods and local state.                                     |

Optional JSX describes the same compositions through Stative's own runtime; it does not require React or produce DOM.

## Documentation

- [Getting started](../../website/docs/en/stative/getting-started.md) — create, update, and observe state.
- [State and derived values](../../website/docs/en/stative/state-and-derived.md) — combine inputs, batch changes, and memoize results.
- [Composition](../../website/docs/en/stative/composition.md) — connect functions, `once` closures, and classes.
- [Switching and lists](../../website/docs/en/stative/collections.md) — follow changing sources and manage item lifetimes.
- [Lifecycle](../../website/docs/en/stative/lifecycle.md) — clean up subscriptions, timers, and other resources.
- [JSX](../../website/docs/en/stative/jsx.md) — declare state flows with optional JSX syntax.

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
