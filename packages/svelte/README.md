# Fluxdown for Svelte

Static and streaming Markdown for Svelte 5, built on `@fluxdown/core`.

```sh
pnpm add @fluxdown/svelte
```

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';
</script>

<Fluxdown text="# Hello, Svelte" />
```

Pass the complete message received so far as `text`, and set `streaming` to `false` when it ends. Use `@fluxdown/svelte/lite` for `FluxdownLite`, or `@fluxdown/svelte/raw` for `FluxdownRaw` with your own plugins.

[Documentation](https://hexmora.github.io/fluxdown/guide/svelte/quick-start.html) · [Plugins](../svelte-plugins) · [MIT](../../LICENSE)
