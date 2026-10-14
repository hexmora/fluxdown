# Getting started

Build an order total that follows changes in quantity to learn Stative's most common operations.

## Install

```sh
pnpm add stative
```

Stative includes TypeScript types and works in browsers and Node.js without a UI framework.

## Create an input and a computation

`MutableState` holds an input you can update. The computation receives plain values and returns a result:

```ts
import { MutableState, render, S } from 'stative';

type TotalInputs = {
  price: number;
  quantity: number;
};

const Total = ({ price, quantity }: TotalInputs) => price * quantity;

const quantity = MutableState.of(2);
const total = render(S([Total, { price: 20, quantity }]));

console.log(total.value.value); // 40
```

`price` is a constant, while `quantity` is a changing state. Both are resolved to their current values before they reach `Total`.

`S([Total, inputs])` describes the computation, and `render` creates its closure. The computation initializes when its output is first accessed.

## Observe changes

Continuing the example, subscribe to the result and update the quantity:

```ts
const subscription = total.value.subscribe((amount) => {
  console.log(amount);
}); // Immediately logs 40

quantity.next(3); // Logs 60
quantity.next(4); // Logs 80

console.log(total.value.value); // 80
```

An active state provides its current value when you subscribe, then delivers subsequent updates. You do not need to forward changes between computations yourself.

The two `value` properties represent different layers: `total.value` is the subscribable state; `total.value.value` is its current value.

## Clean up when finished

```ts
subscription.unsubscribe();
total.destroy();
quantity.destroy();
```

`unsubscribe()` stops this subscription. `total.destroy()` releases the closure's managed children and internal subscriptions. The externally created `quantity` remains yours to manage and needs its own cleanup.

In an application, run this cleanup when the page closes, the component unmounts, or the feature finishes. See [Lifecycle](./lifecycle) for resource management patterns.

## Next steps

Read [State and derived values](./state-and-derived) to combine several inputs, or [Composing computations](./composition) to turn a state flow into a reusable feature.
