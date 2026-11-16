---
title: Streaming rendering - Fluxdown Vue Lynx
description: Render streaming Markdown in Vue Lynx with smoothing, syntax repair and scale, shad, chunk or suffix effects.
---

# Streaming rendering - Fluxdown Vue Lynx {#streaming-content}

Pass accumulated text to `text` and control `streaming` with the request state:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue-lynx';

defineProps<{ text: string; pending: boolean }>();
</script>

<template>
  <Fluxdown :streaming="pending" :text="text" />
</template>
```

Vue Lynx shares [Vue's streaming configuration](../vue/configuration.md#streaming). Setting `streaming` to `true` enables ending repair, smoothing and `scale`.

## Smoothing and animation

```vue
<Fluxdown
  :streaming="pending && { repairEnding: true, smooth: true, effect: 'shad' }"
  :text="text"
/>
```

All four effects use Lynx elements and the same native styles as React Lynx:

- `scale`: reveal text from a smaller, blurred state.
- `shad`: fade each newly visible character in on its own clock.
- `chunk`: fade in incoming text chunks.
- `suffix`: follow the text with a pulsing cursor or dot.

For chunk-based output, turn smoothing off so each incoming chunk keeps its boundary:

```vue
<Fluxdown
  :streaming="pending && { smooth: false, effect: 'chunk' }"
  :text="text"
/>
```

Set `streaming` to `false` on completion, cancellation or failure to show all received text and clear trailing effects.

Compare the renderers in the [side-by-side demo](../common/features/renderers.mdx).
