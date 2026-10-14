# Using JSX

JSX and `S` describe the same thing: connecting existing closures into a new state flow. JSX makes the composition read like a tree, especially when inputs contain other computations or callbacks.

We'll build a draft preview, then add text processing, customizable content, and a list.

> Stative has its own JSX runtime. It does not depend on React or produce DOM. The examples use `.tsx` files; see [TypeScript setup](#configure-typescript) at the end of this page.

## Start with existing closures

Assume your project already has two building blocks: `Clean` trims text, and `Label` adds a prefix. Put them in `base.tsx`; we'll reuse them throughout the examples.

```tsx
import type { IReadableClosure } from 'stative';

import { once, useMap } from 'stative';

type CleanInputs = {
  text: string;
};

type LabelOptions = {
  prefix: string;
};

type LabelInputs = {
  text: IReadableClosure<string>;
  options: LabelOptions;
};

export const Clean = ({ text }: CleanInputs) => text.trim();

export const Label = once(({ text, options }: LabelInputs) =>
  useMap(text, (value) => `${options.prefix}${value}`),
);
```

First, connect the draft state directly to `Label`. `text` is reactive; `options` is fixed configuration, passed unchanged through `D()`:

```tsx
import { D, MutableState, render } from 'stative';

import { Label } from './base';

const draft = MutableState.of('First draft');
const options = { prefix: 'Title: ' };
const preview = render(
  <Label
    text={draft}
    options={D(options)}
  />,
);

console.log(preview.value.value); // "Title: First draft"

draft.next('Final draft');
console.log(preview.value.value); // "Title: Final draft"

preview.destroy();
draft.destroy();
```

This JSX is equivalent to `S([Label, { text: draft, options: D(options) }])`. JSX creates a descriptor; `render` creates the closure you can read, subscribe to, and destroy.

## Turn a composition into a new closure

Now trim the text before adding the prefix. Replace `text={draft}` with `text={<Clean text={draft} />}` to connect the two computations.

To reuse this composition, wrap it in `once`, name it `Preview`, and save it as `preview.tsx`:

```tsx
import type { IReadableClosure } from 'stative';

import { D, once } from 'stative';

import { Clean, Label } from './base';

type PreviewInputs = {
  text: IReadableClosure<string>;
  prefix: string;
};

export const Preview = once(({ text, prefix }: PreviewInputs) => (
  <Label
    text={<Clean text={text} />}
    options={D({ prefix })}
  />
));
```

Callers only need to know what `Preview` accepts, regardless of how many closures it uses internally:

```tsx
import { MutableState, render } from 'stative';

import { Preview } from './preview';

const draft = MutableState.of('  First draft  ');
const preview = render(
  <Preview
    text={draft}
    prefix="Title: "
  />,
);

console.log(preview.value.value); // "Title: First draft"

draft.next('  Final draft  ');
console.log(preview.value.value); // "Title: Final draft"

preview.destroy();
draft.destroy();
```

`Preview` manages the `Clean` and `Label` closures it creates. Destroying it also cleans up those children; the caller still owns the external `draft` state.

> Use `once` or a class's `render()` when returning JSX to compose child closures. A plain mapping function returns its result as a value; JSX inside that result is not resolved again.

## Pass a render callback

Next, let a preview container decide how to present the result while the caller decides how to produce its content. Declare a callback returning `IReadableClosure<string>`. Here we name that input `children`. Save this as `panel.tsx`:

```tsx
import type { IReadableClosure } from 'stative';

import { once, useMap } from 'stative';

type PanelInputs = {
  title: string;
  children: () => IReadableClosure<string>;
};

export const Panel = once(({ title, children }: PanelInputs) => {
  const content = children();

  return useMap(content, (text) => `${title}\n${text}`);
});
```

Inside `Panel`, `children()` always returns a readable closure. At the call site, the callback can return JSX directly: Stative turns it into a child closure.

```tsx
import { MutableState, render } from 'stative';

import { Panel } from './panel';
import { Preview } from './preview';

const draft = MutableState.of('  First draft  ');
const panel = render(
  <Panel title="Publish preview">
    {() => (
      <Preview
        text={draft}
        prefix="Title: "
      />
    )}
  </Panel>,
);

console.log(panel.value.value);
// "Publish preview\nTitle: First draft"

draft.next('  Final draft  ');
console.log(panel.value.value);
// "Publish preview\nTitle: Final draft"

panel.destroy();
draft.destroy();
```

When no extra computation is needed, the same callback can return an existing state or a fixed value:

```tsx
import { MutableState, render } from 'stative';

import { Panel } from './panel';

const draft = MutableState.of('First draft');
const panels = render([
  <Panel
    title="Original"
    children={() => draft}
  />,
  <Panel
    title="Note"
    children={() => 'Content follows the draft'}
  />,
]);

console.log(panels.value.value);
// ["Original\nFirst draft", "Note\nContent follows the draft"]

panels.destroy();
draft.destroy();
```

`children`, `renderItem`, and `create` are all input names you choose. The receiving closure invokes the callback; writing JSX alone does not invoke it. Declare it as `() => IReadableClosure<T>`, or as a function taking one object argument and returning `IReadableClosure<T>`. That object argument may be optional. The receiving closure manages the generated children and cleans them up when it is destroyed.

> Pass child-creation callbacks directly. Wrap ordinary formatting or event callbacks in `D(callback)` to preserve the original function. If a callback needs hooks, put them in a `once` closure returned by the callback.

## Let the list create items and the caller shape them

When the preview grows into multiple drafts, let `DraftList` manage the list and delegate each item's computation to `renderItem`. Save this as `draft-list.tsx`:

```tsx
import type { IReadableClosure } from 'stative';

import { once, useMapEach } from 'stative';

type RenderItemInputs = {
  item: IReadableClosure<string>;
  index: number;
};

type DraftListInputs = {
  items: IReadableClosure<string[]>;
  renderItem: (inputs: RenderItemInputs) => IReadableClosure<string>;
};

export const DraftList = once(({ items, renderItem }: DraftListInputs) =>
  useMapEach(items, (item, index) => renderItem({ item, index })),
);
```

Reuse the same `Preview` as before:

```tsx
import { MutableState, render } from 'stative';

import { DraftList } from './draft-list';
import { Preview } from './preview';

const drafts = MutableState.of(['  Opening  ', '  Ending  ']);
const list = render(
  <DraftList
    items={drafts}
    renderItem={({ item, index }) => (
      <Preview
        text={item}
        prefix={`${index + 1}. `}
      />
    )}
  />,
);

console.log(list.value.value); // ["1. Opening", "2. Ending"]

drafts.next(['  Opening  ', '  Body  ', '  Ending  ']);
console.log(list.value.value);
// ["1. Opening", "2. Body", "3. Ending"]

list.destroy();
drafts.destroy();
```

`useMapEach` manages child computations by position, updating each item's state when the input changes. To preserve items by a business ID, use [useMapKeyed](./collections#choose-position-or-identity).

For a fixed list, an ordinary array `.map()` is enough. Pass the resulting descriptor array to `render`:

```tsx
import { render } from 'stative';

import { Clean } from './base';

const sections = ['  Opening  ', '  Ending  '];
const list = render(sections.map((text) => <Clean text={text} />));

console.log(list.value.value); // ["Opening", "Ending"]

list.destroy();
```

## Supported input forms

For `once` and classes, **the input declaration tells you what the closure receives**. These are the supported forms behind the examples above:

| Input declaration                                         | What callers can pass                                                      | What the closure receives                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `IReadableClosure<T>`                                     | `MutableState`, `ReactiveState`, RxJS `BehaviorSubject`                    | A readable closure following the source                      |
| `IReadableClosure<T>`                                     | An existing readable closure, JSX, `S(...)`, a zero-argument closure class | The corresponding readable closure                           |
| `IReadableClosure<T>`                                     | An ordinary object or array matching `T`                                   | A closure with a fixed output; its contents are not resolved |
| `() => IReadableClosure<T>`                               | A function returning any source above, or an ordinary fixed value          | A function that creates a readable child closure             |
| `(inputs: Inputs) => IReadableClosure<T>`                 | The same, with a named `Inputs` type for one object argument               | A child-closure factory receiving that same argument object  |
| A primitive type such as `string` or `number`             | The value itself or `D(value)`                                             | A fixed value                                                |
| Static configuration: objects, arrays, ordinary functions | `D(value)`                                                                 | The original object, array, or function                      |

For example, `children={() => <Preview ... />}`, `children={() => state}`, and `children={() => S(...)}` are all factories. So is `children={() => 'Fixed content'}`. To pass a fixed string or number directly into a readable input, wrap it in `ReactiveState.of(value)`.

For **plain mapping functions**, inputs are resolved to ordinary values first. States and JSX nested in arrays or objects are resolved recursively too. For example, a function declaring `lines: string[]` can receive `lines={[<Clean text={draft} />, 'Fixed footer']}`. `D(value)` preserves a value and its contents as they are.

To expose multiple outputs, pass an array or object to `render`, or return one from `once` or a class's `render()`. JSX tags can be plain functions, `once` functions, or classes, with no input or one object input.

> Stative does not support HTML tags or fragments (`<>...</>`). `key` is an ordinary declared input, not a list-reconciliation mechanism. Use collection hooks for dynamic lists.

## Configure TypeScript

Enable Stative JSX in your project and use the `.tsx` extension:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "stative"
  }
}
```

> If your project also uses another JSX runtime, or you prefer to keep its global configuration, add `/** @jsxImportSource stative */` at the very top of these `.tsx` files. Keep state-flow composition and UI code in separate files.
