# State and updates

Core's inputs and outputs are reactive. As text grows or configuration changes, the existing data flow updates. You do not need to create a new Core instance for each network chunk.

This page continues with `text`, `core`, and `MarkdownBlock` from the [quick start](./quick-start.md).

## Append text

Pass the full current content to `text.next`:

```ts
function append(chunk: string) {
  text.next(text.value + chunk);
}

append('\n\nA new paragraph');
append(' that keeps growing.');
```

If your source already returns accumulated text, use `text.next(fullText)` directly.

## Subscribe to the list and its content

An update can add a block or change the content of an existing one. Your UI integration needs to handle both:

```ts
const listSubscription = core.value.subscribe((blocks) => {
  console.log('Current blocks:', blocks);
});

const firstBlock = core.value.value[0];
const contentSubscription = firstBlock?.value.subscribe((tree) => {
  console.log('First block content:', tree);
});

// When these subscriptions are no longer needed
listSubscription.unsubscribe();
contentSubscription?.unsubscribe();
```

In an integration, subscribe to a block's `value` when it enters the list and unsubscribe when it leaves. The outer array and blocks can keep the same references, so reference comparisons alone can miss content updates.

Use `renderItem` to create a view bound to a content block. Have that view subscribe to `block.value` instead of reading the tree only once during creation.

## Make configuration reactive

For example, enable trailing syntax repair while receiving text and switch to the final presentation when the stream ends. Pass a reactive `build` when creating Core:

```ts
import type { BlockCompilerConfig } from '@fluxdown/core';

import { MutableState } from 'stative';

const build = MutableState.of<BlockCompilerConfig>({
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
});
```

Replace the static `build` object from the quick start with this state. When the stream finishes:

```ts
build.next({ ...build.value, repairEnding: false });
```

`repair` controls the repair system as a whole. `repairEnding` controls repairs for the streaming tail. The remaining fields enable footnotes, formulas, indented code blocks, and Setext headings.

## Enable smooth output

Core includes `Smooth` but does not enable it automatically. Install `@fluxdown/core-plugins` to configure this preset explicitly:

```sh
pnpm add @fluxdown/core-plugins
```

Add this configuration to the inputs used to create Core:

```ts
import type { MapperPluggable } from '@fluxdown/core';

import { Smooth } from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { MutableState, toClosure } from 'stative';

const smoothEnabled = MutableState.of(true);
const active = toClosure(smoothEnabled);

const mappers: MapperPluggable[] = [[Smooth, { enabled: active }]];
```

Once you pass `mappers` to Core, newly added content enters the output gradually. Your renderer continues to receive updates through its list and content block subscriptions.

When finished, you can turn smoothing off to show the remaining content immediately:

```ts
smoothEnabled.next(false);
```

`Shad` marks each newly visible character with its own fade. Its `enabled`, `length`, and `duration` options accept plain values or readable closures; `length` is how many characters it aims to keep fading at once (default `10`), and `duration` is the longest fade in milliseconds (default `400`), shortened while more characters are in flight. Your renderer must support those nodes to produce a visual fade. The React, Vue, React Native, Lynx, Solid and Taro presets include the corresponding render plugin.

`Scale` adds character and word markers for a per-character entrance. Like `Smooth`, its `enabled`, `duration`, `from`, and `blur` options accept plain values or readable closures. Your renderer must handle the markers; the React, Vue, React Native, Lynx, Solid and Taro components expose the simpler [`streaming.effect`](../common/streaming-effects/animation/index.mdx) configuration.

## Clean up

Keep each Core instance tied to one content lifecycle. When you are done, cancel your subscriptions, then destroy Core and any externally created inputs:

```ts
core.destroy();
text.destroy();
build.destroy();
active.destroy();
smoothEnabled.destroy();
```

Core cleans up the states and plugins it creates. You remain responsible for states created outside it.
