# Marked

Moving from Marked to Core changes the output from a single HTML result to a set of updatable content blocks. If you only need to display Markdown in an app, use the [renderer for your framework](../../common/features/renderers.mdx). This guide is for projects that manage their own output.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to an agent working in your project:

```markdown
# Goal

Migrate the project's Marked processing pipeline to @fluxdown/core. Implement the changes while preserving input and output contracts and application behavior.

# References

- Marked: https://marked.js.org/
- Fluxdown Core: https://hexmora.github.io/fluxdown/guide/core/quick-start.html
- Configuration and plugins: https://hexmora.github.io/fluxdown/guide/core/configuration.html

# Work

1. Inspect installed versions and every Marked call. Identify HTML consumers, extensions, async processing, and sanitization. Prefer a Fluxdown framework renderer for display-only integrations.
2. Where Core is needed, create a reusable content lifecycle: accumulated text as input and a renderer for HAST blocks. Keep a serialization adapter at boundaries that still require HTML strings.
3. Port tokenizer, walkTokens, renderer, and hooks by responsibility, without reusing Marked token types. Check line breaks, HTML, code blocks, and custom syntax against real content. Preserve useful async logic and security filtering.
4. Handle updates, block subscriptions, and cleanup. Run the project's checks and verify static content, successive appends, replacement, and disposal. Remove Marked and its dedicated dependencies only after confirming no remaining uses.

# Deliver

Summarize migrated entry points, validation, and differences needing a decision. Report features without an equivalent rather than silently removing them.
```

</div>
</details>

## Replace the HTML output boundary

A Marked integration often starts with a single call:

```ts
import { marked } from 'marked';

const html = await marked.parse('# Hello');
```

Install Core and a serializer to keep the HTML output contract:

```sh
pnpm add @fluxdown/core @fluxdown/types stative hast-util-to-html
pnpm add -D @types/hast
```

Create `BlocksRenderer`, `text`, and `core` using the [quick start](../quick-start.md). To read HTML, pass each block's current HAST to [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html):

```ts
import { toHtml } from 'hast-util-to-html';

const readHtml = () =>
  core.value.value.map((block) => toHtml(block.value.value)).join('');

console.log(readHtml());

text.next('# Hello\n\nMore content');
console.log(readHtml());
```

This reads a snapshot. A live view must subscribe to both the block list and each block's content, as described in [state and updates](../streaming.md). Returning an HTML string once from `renderItem` would miss later changes within an existing block.

## Port extensions and options

| Marked usage                | Core equivalent                                                                                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokenizer`, custom syntax  | [remark plugins](../plugins/remark.mdx) for Markdown syntax.                                                                                                                                             |
| `walkTokens`                | [remark](../plugins/remark.mdx) for Markdown AST transforms, [rehype](../plugins/rehype.mdx) for HTML AST transforms; use [repair](../plugins/repair.mdx) for work that should follow the repair switch. |
| `renderer`                  | A custom renderer, or rehype for changes to HTML nodes.                                                                                                                                                  |
| Async `hooks`, data loading | Complete before passing text to Core, or retain in the application's data layer.                                                                                                                         |

The quick start's syntax settings suit streaming content. For static articles, enable `build.indentedCode` and `build.setextHeading` where needed, and turn off `build.repairEnding`; see [configuration](../configuration.md). Compare line breaks, links, and HTML output against existing samples too.

Core includes HTML filtering, but its rules differ from your existing sanitizer. Preserve the current security constraints while configuring [allowed tags and attributes](../plugins/rehype.mdx). Core also has no code-highlighting UI: use a framework renderer or implement that in your output pipeline.

## Finish the migration

Give each independent document or message its own Core instance. When finished, unsubscribe from your subscriptions, then release the instance and external input:

```ts
core.destroy();
text.destroy();
```

Remove Marked and unused extensions once no other entry points depend on them.
