# svelte-markdown

Start by passing `SvelteMarkdown`'s string `source` to Fluxdown's `text`. Fluxdown requires Svelte 5, so check the framework version before migrating an older project.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to the agent working in your project:

```markdown
Migrate the project from svelte-markdown to @fluxdown/svelte. Implement the changes.

# References

- Source: https://github.com/pablo-abc/svelte-markdown
- Target: https://hexmora.github.io/fluxdown/guide/svelte/quick-start.html

# Steps

1. Confirm Svelte 5 compatibility. Find SvelteMarkdown usages, including source, renderers, Marked options, and parsed events. If the framework is incompatible, explain the required upgrade before forcing dependencies.
2. Replace the component with Fluxdown and move string source to text while preserving data flow. For token-array sources, locate the original Markdown; do not stringify tokens into text.
3. Use the target docs to migrate custom renderers, syntax, and styles. Use Slot plugins for components, adapting their props and Svelte 5 snippets. Marked options and token callbacks are not direct replacements.
4. For streams, pass accumulated text and derive streaming from the request state. Preserve catalogs and link/image interactions.
5. Run existing checks and verify articles, custom components, and stream completion. Remove only unused dependencies.

Report changes, verification results, and remaining behavior differences without silently removing features.
```

</div>
</details>

## Replace the component

```sh
pnpm add @fluxdown/svelte
```

Before:

```svelte
<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown';

  export let text: string;
</script>

<SvelteMarkdown source={text} />
```

After:

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  let { text }: { text: string } = $props();
</script>

<Fluxdown {text} />
```

The component loads its styles. Follow the [styling guide](../customization.md) to adjust themes and fonts.

## Move custom renderers

Move `renderers` components to [Slot plugins](../plugins/slot.md). For example, `renderers.code` maps to `CodeBlock`, and `renderers.link` maps to `Link`. Adapt the component props to types such as `CodeBlockProps` or `LinkProps`; render child content with `{@render children?.()}`.

Fluxdown does not accept Marked `options` or pre-parsed token arrays. Keep the original Markdown and implement extra syntax or tree changes with [Remark](../../core/plugins/remark.mdx) or [Rehype](../../core/plugins/rehype.mdx) plugins. Code that builds a catalog from `parsed` events needs its heading handling connected again.

Fluxdown displays ordinary newlines as line breaks. Enable indented code and Setext headings if existing articles need them:

```svelte
<Fluxdown {text} build={{ indentedCode: true, setextHeading: true }} />
```

## Connect streaming content

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  let { text, pending }: { text: string; pending: boolean } = $props();
</script>

<Fluxdown {text} streaming={pending} />
```

Pass accumulated text and set `pending` to `false` when the request finishes. See the [svelte-markdown README](https://github.com/pablo-abc/svelte-markdown) for the original renderers and events.
