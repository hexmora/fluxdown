# Quick start

The Svelte component builds on Core with syntax repair, smooth streaming and replaceable rendering slots. It uses Svelte 5 and works in existing Svelte and SvelteKit projects.

## Install

```sh
pnpm add @fluxdown/svelte
```

Your project's Svelte compiler processes the components. Importing them also loads their styles.

## Render your first message

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  const markdown = `# Hello, Fluxdown

Keep content **easy to read** while it arrives.`;
</script>

<Fluxdown text={markdown} />
```

## Connect streaming text

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  type MessageProps = {
    text: string;
    pending: boolean;
  };

  let { text, pending }: MessageProps = $props();
</script>

<Fluxdown streaming={pending} {text} />
```

Always pass the complete text received so far. Set `streaming` to `false` when the request ends.

## Choose a component

`Fluxdown` includes code highlighting, math and diagrams. `FluxdownLite` provides the basics, while `FluxdownRaw` takes the complete plugin list you supply.

> Import `Fluxdown` from `@fluxdown/svelte` or `@fluxdown/svelte/full`, `FluxdownLite` from `@fluxdown/svelte/lite`, and `FluxdownRaw` from `@fluxdown/svelte/raw`.

## Next steps

- [Streaming](./streaming.md): control smoothing and trailing effects.
- [Styling](./customization.md): adjust colors, typography and spacing.
- [Plugin matrix](./plugins/matrix.mdx): choose a preset or assemble your own.
- [Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, Svelte, React Native, Lynx, Solid, Taro, and Angular together.
