# State and derived values

Keep the data you actively change in state, and derive the values you can calculate. That gives every value a clear source.

## Update state

Use `MutableState.of()` to set the initial value, `next()` to write a new value, and `value` to read the current one:

```ts
import { MutableState } from 'stative';

const profile = MutableState.of({ name: 'Lin', online: false });

profile.next({ ...profile.value, online: true });
console.log(profile.value.online); // true

profile.destroy();
```

By default, state uses `Object.is` to compare values. When updating an object or array, create a new value and pass it to `next()`. Mutating the original object does not publish an update.

## Derive a result from several inputs

A computation can depend on several states. Its result follows changes in any of them:

```ts
import { MutableState, render, S } from 'stative';

type NameInputs = {
  first: string;
  last: string;
};

const FullName = ({ first, last }: NameInputs) => `${first} ${last}`;

const first = MutableState.of('Ada');
const last = MutableState.of('Lovelace');
const name = render(S([FullName, { first, last }]));

console.log(name.value.value); // "Ada Lovelace"

first.next('Augusta Ada');
console.log(name.value.value); // "Augusta Ada Lovelace"

name.destroy();
first.destroy();
last.destroy();
```

Keep these functions pure: calculate a result from the inputs and return it. Manage timers, event listeners, and other resources through the [closure's lifecycle](./lifecycle).

## Publish several updates together

When several changes belong to one operation, group them with `batch`:

```ts
import { batch, MutableState, render, S } from 'stative';

type NameInputs = {
  first: string;
  last: string;
};

const FullName = ({ first, last }: NameInputs) => `${first} ${last}`;

const first = MutableState.of('Ada');
const last = MutableState.of('Lovelace');
const name = render(S([FullName, { first, last }]));
const subscription = name.value.subscribe((value) => console.log(value));

batch(() => {
  first.next('Grace');
  last.next('Hopper');
}); // This operation only publishes "Grace Hopper"

subscription.unsubscribe();
name.destroy();
first.destroy();
last.destroy();
```

Subscribers do not receive a partially updated name. `batch` covers synchronous updates only. After an asynchronous operation finishes, use another batch to publish its results together.

## Skip repeated work

Wrap a computation in `memo` when it is expensive or receives equivalent inputs repeatedly:

```ts
import { memo } from 'stative';

type TextInputs = {
  text: string;
};

const WordCount = memo(({ text }: TextInputs) => {
  const trimmed = text.trim();

  return trimmed ? trimmed.split(/\s+/).length : 0;
});
```

`memo` shallowly compares inputs by default and skips the computation when they are equivalent. It also compares results with `Object.is` to avoid publishing an unchanged result. Each rendered closure has its own cache.

If the computation returns an object, use the third argument to compare results:

```ts
const TextSummary = memo(
  ({ text }: TextInputs) => ({ length: text.length }),
  undefined,
  (previous, next) => previous.length === next.length,
);
```

A comparison function returns `true` for equivalent values. Add custom comparisons when they serve a need; most simple computations work well as plain functions.
