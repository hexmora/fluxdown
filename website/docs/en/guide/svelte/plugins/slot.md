# Slot plugins

Slot plugins provide the components that render prepared content such as code, links and headings. Use them to change appearance and interactions.

## Declare and use

This example hides the code toolbar while retaining highlighting and code styles. Start with an ordinary Svelte component:

```svelte title="compact-code-block/main.svelte"
<script lang="ts">
  import type { CodeBlockProps } from '@fluxdown/svelte-plugins/base';

  let { Raw, ...props }: CodeBlockProps = $props();
</script>

{#if Raw}
  {@render Raw({ ...props, showHeader: false })}
{/if}
```

Export the component from its directory entry, then register it for the `CodeBlock` slot:

```ts title="compact-code-block/index.ts"
export { default as CompactCodeBlock } from './main.svelte';
```

```ts title="plugins.ts"
import { BaseSlotPlugin } from '@fluxdown/svelte-plugins/base';

import { CompactCodeBlock } from './compact-code-block';

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  import { CompactCodeBlockPlugin } from './plugins';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();
</script>

<Fluxdown plugins={{ slots: [CompactCodeBlockPlugin] }} {text} />
```

`key` identifies the plugin, `type` selects the slot, and `Component` points to the Svelte component. Fluxdown manages plugin creation and cleanup.

> Import plugin bases and prop types from `@fluxdown/svelte-plugins/base`. Install `@fluxdown/svelte-plugins` first.

## Preserve default behavior

`Raw` is the rendering snippet supplied by the previous plugin. Call `{@render Raw(props)}` to preserve existing highlighting or layout, and change its props to adjust one part.

At equal priority, later plugins for the same slot wrap earlier components through `Raw`. To replace the slot entirely, write your own Svelte template. Slots with nested content render it with `{@render children?.()}`.

> `Raw` can be `null`; check it before rendering. Both `Raw` and `children` are Svelte snippets.

## Add an interaction

For example, track a link click while preserving its previous callback:

```svelte title="tracked-link/main.svelte"
<script lang="ts">
  import type { LinkProps } from '@fluxdown/svelte-plugins/base';

  import { trackLink } from '../analytics';

  let { Raw, ...props }: LinkProps = $props();

  const handleClick: NonNullable<LinkProps['onclick']> = (event) => {
    trackLink(props.href);

    props.onclick?.(event);
  };
</script>

{#if Raw}
  {@render Raw({ ...props, onclick: handleClick })}
{/if}
```

```ts title="tracked-link/index.ts"
export { default as TrackedLink } from './main.svelte';
```

Assign `TrackedLink` to the `Component` field of a `BaseSlotPlugin<'Link'>` subclass, then add it to `plugins.slots`. Your application supplies `trackLink`.
