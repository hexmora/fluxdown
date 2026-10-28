# @fluxdown/uni-app

uni-app x Vapor components for streaming Markdown. Requires HBuilderX 5.33 or later.

[Quick start](https://hexmora.github.io/fluxdown/guide/uni-app/quick-start.html) covers the project configuration.

```vue
<script setup lang="ts">
import { Fluxdown } from "@fluxdown/uni-app";
</script>

<template>
  <Fluxdown text="# Hello, Fluxdown" />
</template>
```

Use `@fluxdown/uni-app/lite` for the lite preset, or `@fluxdown/uni-app/raw` with your own plugins.
