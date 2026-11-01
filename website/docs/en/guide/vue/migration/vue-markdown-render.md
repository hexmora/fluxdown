# vue-markdown-render

For a basic view, rename `source` to `text` and keep the existing reactive data. Review `markdown-it` options and plugins separately.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to the agent working in your project:

```markdown
Migrate the project from vue-markdown-render to @fluxdown/vue. Implement the changes.

# References

- Source: https://github.com/cloudacy/vue-markdown-render
- Target: https://hexmora.github.io/fluxdown/guide/vue/quick-start.html

# Steps

1. Check dependency versions and all VueMarkdown usages, including options, markdown-it plugins, styles, and custom HTML.
2. Replace the component with Fluxdown and move source to text, preserving Vue reactivity and request logic.
3. Map syntax, themes, and interactions using the target docs. Prefer built-in features; use Remark/Rehype plugins for additional syntax and Slot plugins for components. Do not pass markdown-it plugins directly to plugins.
4. For streams, pass accumulated text and end streaming correctly. Check line breaks, heading anchors, HTML, and server-rendered styles.
5. Run existing checks, verify real content, and remove only dependencies with no remaining usages.

Report the changes and verification results. Identify behavior that cannot be preserved instead of silently removing features.
```

</div>
</details>

## Replace the component

```sh
pnpm add @fluxdown/vue
```

Before:

```vue
<script setup lang="ts">
import VueMarkdown from 'vue-markdown-render';

const props = defineProps<{ text: string }>();
</script>

<template>
  <VueMarkdown :source="props.text" />
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

The browser entry loads styles. For SSR, import `@fluxdown/vue/styles.css` at the application entry, then use the [styling guide](../customization.md) to adjust the theme.

## Adapt parsing and plugins

Fluxdown includes tables, task lists, strikethrough, and ordinary line breaks. Compare content that depends on `options.breaks`, `linkify`, or custom parsing rules. Indented code and Setext headings are disabled by default; enable them if existing articles use them:

```vue
<Fluxdown
  :text="props.text"
  :build="{ indentedCode: true, setextHeading: true }"
/>
```

The two libraries use different `plugins` interfaces. Replace `markdown-it` extensions with [Remark plugins](../../core/plugins/remark.mdx) for syntax, [Rehype plugins](../../core/plugins/rehype.mdx) for tree changes such as heading anchors, or [Slot plugins](../plugins/slot.md) for link and code components. The Rehype guide also covers allowed HTML.

For streams, pass the complete text received so far and use the request state for `streaming`:

```vue
<Fluxdown :text="text" :streaming="pending" />
```

Set `pending` to `false` when the request finishes. The original configuration is documented in the [vue-markdown-render README](https://github.com/cloudacy/vue-markdown-render).
