# md-editor-v3

Replace `MdPreview` with Fluxdown and keep the same Markdown data. Editing, uploads, and saving still belong to `MdEditor`; this guide covers the reading view.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to the agent working in your project:

```markdown
Migrate the project's md-editor-v3 Markdown previews to @fluxdown/vue. Implement the changes.

# References

- Source: https://imzbf.github.io/md-editor-v3/en-US/api/
- Target: https://hexmora.github.io/fluxdown/guide/vue/quick-start.html

# Steps

1. Check dependency versions and locate MdPreview, preview styles, catalogs, and custom parser configuration.
2. Move preview modelValue to Fluxdown's text. Preserve the Markdown data flow and MdEditor's editing, upload, and save behavior.
3. Map themes, code blocks, math, and custom components according to actual usage. Start with built-in features, then consult the configuration and plugin docs; do not copy markdown-it options unchanged.
4. For streaming content, pass accumulated text and derive streaming from the request state. Check heading anchors and HTML handling without relying on the old DOM structure.
5. Run existing project checks and compare real articles, including styles, links, math, and navigation. Remove only unused dependencies and styles.

Report changes, verification results, and remaining differences. Preserve any feature that cannot be migrated equivalently and explain why.
```

</div>
</details>

## Replace the preview

Install the Vue 3 package:

```sh
pnpm add @fluxdown/vue
```

Before:

```vue
<script setup lang="ts">
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

const props = defineProps<{ text: string }>();
</script>

<template>
  <MdPreview :model-value="props.text" />
</template>
```

After:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

const props = defineProps<{ text: string }>();
</script>

<template>
  <Fluxdown :text="props.text" />
</template>
```

The browser entry loads styles. For server rendering, import `@fluxdown/vue/styles.css` at the application entry.

## Keep the article features

You can continue using `theme="dark"`. Adapt `previewTheme`, `codeTheme`, and existing CSS selectors through [Fluxdown themes](../customization.md).

The full preset includes code highlighting. Pele renders Mermaid code blocks; check the [supported diagrams](../../react/features/diagrams.mdx) against your content. Enable parsing for articles containing math or footnotes:

```vue
<Fluxdown :text="props.text" :build="{ tex: true, footnote: true }" />
```

Move syntax extensions from `markdownItConfig` to [Remark plugins](../../core/plugins/remark.mdx), and link, image, or code components to [Slot plugins](../plugins/slot.md). Check the built-in features before adding replacements.

`MdCatalog` depends on the original library's headings and events, so it cannot bind directly to Fluxdown. Keep catalogs used by the editor; a catalog for the reading view needs its heading collection, anchor IDs, and scrolling connected again. Check custom HTML against the [allowed tags and sanitization rules](../../core/plugins/rehype.mdx).

Keep `md-editor-v3` and its required styles while `MdEditor` or `MdCatalog` remains in use. See the [md-editor-v3 documentation](https://imzbf.github.io/md-editor-v3/en-US/api/) for the original settings.
