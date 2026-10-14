# Composing computations

A **state closure** brings together inputs, a computation, and the lifetime of its children. Stative offers three declaration forms. All three can be created with `render(S([Declaration, inputs]))` or described with JSX.

## Choose a declaration form

| Form            | Receives                                                   | Updates by                                                 | Best for                                                   |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| Pure function   | Current input values                                       | Running the function again when inputs change              | Formatting, filtering, and calculations                    |
| `once` function | Readable closures and static options                       | Building once, then following the connected state flow     | Composing child computations and managing local resources  |
| Class           | Readable closures and static options through `this.inputs` | Building once in `render()`, then following the state flow | Features that benefit from instance methods or local state |

Start with a pure function. Choose `once` when you need to connect a state flow, or a class when instance methods are useful. These forms can be nested together; you do not need to choose one for the whole project.

## Pure function: calculate the current result

A plain function receives values that have already been resolved. This one formats a price from quantity and unit price:

```ts
type PriceInputs = {
  quantity: number;
  price: number;
};

const PriceLabel = ({ quantity, price }: PriceInputs) =>
  `$${(quantity * price).toFixed(2)}`;
```

The function runs when its output is first accessed, then again when its dependencies change. Keep it pure: return a result from the inputs without starting timers or opening external connections.

## `once` function: connect a state flow

A function wrapped in `once` builds its state flow on the first output access. Changing inputs use `IReadableClosure<T>`; the static unit price remains a plain number:

```ts
import type { IReadableClosure } from 'stative';

import { once, useMap, useSelect } from 'stative';

type PriceInputs = {
  quantity: IReadableClosure<number>;
  price: number;
};

const PriceLabel = once(({ quantity, price }: PriceInputs) => {
  const amount = useSelect(quantity, (value) => value * price);

  return useMap(amount, (value) => `$${value.toFixed(2)}`);
});
```

When the quantity changes, the `once` body does not run again. The computations connected by `useSelect` and `useMap` update the result.

| Helper                       | Purpose                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `useSelect(source, project)` | Select a field or compute a pure projection; stays unsubscribed until first observed                    |
| `useMap(source, map)`        | Connect a derived computation; its second callback argument also provides the previous input and result |
| `useCreate(description)`     | Create and manage a reusable child closure                                                              |

`useMap` and `useSelect` also accept arrays of sources, such as `useMap([left, right], ([a, b]) => a + b)`.

Call these helpers synchronously inside the `once` body. They belong to Stative's runtime and are not React Hooks.

## Class: organize a computation around an instance

Extend `BaseStateClosure` and connect the inputs to the output in `render()`:

```ts
import type { IReadableClosure } from 'stative';

import { BaseStateClosure } from 'stative';

type PriceInputs = {
  quantity: IReadableClosure<number>;
  price: number;
};

class PriceLabel extends BaseStateClosure<string, PriceInputs> {
  protected render() {
    const { quantity, price } = this.inputs;
    const amount = this.select(quantity, (value) => value * price);

    return this.map(amount, (value) => `$${value.toFixed(2)}`);
  }
}
```

`this.map`, `this.select`, and `this.create` correspond to the helpers used inside `once`. A class can also expose its own instance methods. Creating it with `render(S([YourClass, inputs]))` preserves its concrete instance type.

## Create each form the same way

Choose any one of the `PriceLabel` declarations above. The calling code stays the same:

```ts
import { MutableState, render, S } from 'stative';

const quantity = MutableState.of(2);
const label = render(S([PriceLabel, { quantity, price: 20 }]));

console.log(label.value.value); // "$40.00"

quantity.next(3);
console.log(label.value.value); // "$60.00"

label.destroy();
quantity.destroy();
```

The key distinction is the input: a pure function receives the current numeric `quantity`, while `once` and class declarations receive a readable closure.

## Nest computations

A computation's output can become another computation's input. Place another `S` descriptor in an input to connect them:

```ts
import { MutableState, render, S } from 'stative';

type SubtotalInputs = {
  price: number;
  quantity: number;
};

type FormatInputs = {
  amount: number;
};

const Subtotal = ({ price, quantity }: SubtotalInputs) => price * quantity;
const FormatPrice = ({ amount }: FormatInputs) => `$${amount.toFixed(2)}`;

const quantity = MutableState.of(2);
const amount = S([Subtotal, { price: 20, quantity }]);
const label = render(S([FormatPrice, { amount }]));

console.log(label.value.value); // "$40.00"

quantity.next(3);
console.log(label.value.value); // "$60.00"

label.destroy();
quantity.destroy();
```

`label` manages the nested child computations. Destroying it also releases those children.

## Pass ordinary options

In `once` and class declarations, primitive constants such as numbers and strings pass through unchanged. Wrap static objects, arrays, and ordinary callbacks in `D()` to use them as plain values:

```ts
import type { IReadableClosure } from 'stative';

import { D, MutableState, once, render, S, useMap } from 'stative';

type FormatOptions = {
  currency: string;
};

type FormatInputs = {
  amount: IReadableClosure<number>;
  options: FormatOptions;
};

const Format = once(({ amount, options }: FormatInputs) =>
  useMap(amount, (value) => `${options.currency}${value.toFixed(2)}`),
);

const amount = MutableState.of(42);
const options = D({ currency: '$' });
const label = render(S([Format, { amount, options }]));

console.log(label.value.value); // "$42.00"

label.destroy();
amount.destroy();
```

To provide a constant as a reactive input, wrap it in `ReactiveState.of(value)`. `D()` preserves a value; it does not make an object reactive. Callbacks that create child closures have their own composition behavior; see [render callbacks in JSX](./jsx#pass-a-render-callback).
