---
title: Vue 3 Markdown Renderer
description: Add Fluxdown to a Vue 3 app. Render Markdown in a single-file component, connect streaming text, and customize the output with themes and plugins.
---

# Vue 3 Markdown renderer quick start {#quick-start}

Fluxdown provides a Markdown component for Vue 3. It uses the same Core for static content, streaming repair, smooth output and trailing effects. Themes and plugins let you adapt its presentation.

## Install

```bash
pnpm add @fluxdown/vue
```

Use it in a Vue 3 single-file component:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

const text = '# Hello, Fluxdown\n\nGive words room to unfold.';
</script>

<template>
  <Fluxdown :text="text" />
</template>
```

> The browser entry loads the component styles. For server rendering, import `@fluxdown/vue/styles.css` in your application entry so the initial page uses the same styles.

## Receive streaming content

`text` always contains the complete text received so far. Pass `streaming` while content is arriving, then set it to `false` when the response ends:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

type MessageProps = {
  text: string;
  pending: boolean;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <Fluxdown :text="props.text" :streaming="props.pending" />
</template>
```

Vue updates the content as the props change. Your application owns the network request and message state; the component handles presentation.

## Choose a preset

| Component      | Entry                | Purpose                                                        |
| -------------- | -------------------- | -------------------------------------------------------------- |
| `Fluxdown`     | `@fluxdown/vue`      | Full preset with code highlighting, math and diagrams.         |
| `FluxdownLite` | `@fluxdown/vue/lite` | Basic Markdown and all four trailing effects, ready to extend. |
| `FluxdownRaw`  | `@fluxdown/vue/raw`  | Supply `plugins` to choose every capability.                   |

See the [plugin matrix](./plugins/matrix.mdx) for the full list. Continue with [streaming content](./streaming.md) to adjust the output pace, or the [styling guide](./customization.md) to change its appearance.
