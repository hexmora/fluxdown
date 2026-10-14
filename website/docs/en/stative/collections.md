# Switching and lists

Dependencies can change: users switch between views, and lists grow, shrink, or reorder. Stative can adjust child computations and release the ones no longer needed.

## Follow the selected state

Use `useSwitchMap` to choose a state flow from the current input. After a switch, the result follows the new source:

```ts
import type { IReadableClosure } from 'stative';

import { MutableState, once, render, S, useSwitchMap } from 'stative';

type Mode = 'brief' | 'full';

type DescriptionInputs = {
  mode: IReadableClosure<Mode>;
};

const brief = MutableState.of('Short description');
const full = MutableState.of('Full description');
const mode = MutableState.of<Mode>('brief');

const Description = once(({ mode }: DescriptionInputs) =>
  useSwitchMap(mode, (value) => (value === 'brief' ? brief : full)),
);

const description = render(S([Description, { mode }]));

console.log(description.value.value); // "Short description"

mode.next('full');
full.next('Updated full description');
console.log(description.value.value); // "Updated full description"

description.destroy();
mode.destroy();
brief.destroy();
full.destroy();
```

The callback can also return an `S(...)` descriptor. Stative creates its child closure and releases the old child when it is replaced. External states created beforehand, such as `brief` and `full` above, remain yours to clean up.

## Keep computations for list items

Use `useMapKeyed` to keep one child computation for each stable input. Existing computations are reused when the list is reordered:

```ts
import type { IReadableClosure } from 'stative';

import { MutableState, once, render, S, useMapKeyed } from 'stative';

type ItemInputs = {
  id: string;
};

type LabelsInputs = {
  ids: IReadableClosure<string[]>;
};

const ItemLabel = ({ id }: ItemInputs) => `Document ${id.toUpperCase()}`;

const Labels = once(({ ids }: LabelsInputs) =>
  useMapKeyed(ids, (id) => S([ItemLabel, { id }])),
);

const ids = MutableState.of(['a', 'b']);
const labels = render(S([Labels, { ids }]));

console.log(labels.value.value); // ["Document A", "Document B"]

ids.next(['b', 'a', 'c']);
console.log(labels.value.value); // ["Document B", "Document A", "Document C"]

labels.destroy();
ids.destroy();
```

Each input item is its own key, using JavaScript `Map` equality. String IDs work well; object inputs need stable references. Duplicate items share a child computation but still appear in every corresponding output position.

Removing an item releases its child computation. Destroying the list closure releases the remaining children.

## Choose position or identity

| Helper        | Suitable lists                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `useMapEach`  | Position matters, and each position's computation should receive the latest item at that position |
| `useMapKeyed` | Items have stable identities, and their computations should survive reordering                    |

The `useMapEach` callback receives a readable item closure and an index: `(item, index) => S(...)`. The `useMapKeyed` callback receives the input item itself: `(item) => S(...)`.

Classes provide the equivalent `this.switchMap`, `this.mapEach`, and `this.mapKeyed` methods.
