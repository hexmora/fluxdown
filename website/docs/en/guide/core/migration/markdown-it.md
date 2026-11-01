# markdown-it

markdown-it usually turns Markdown into an HTML string. Core keeps subscribable content blocks so they can update over time. Start by deciding whether consumers still need HTML or will use your own renderer.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to an agent working in your project:

```markdown
# Goal

Migrate the project's markdown-it processing to @fluxdown/core. Implement the changes while preserving existing content and application behavior.

# References

- markdown-it: https://markdown-it.github.io/markdown-it/
- Fluxdown Core: https://hexmora.github.io/fluxdown/guide/core/quick-start.html
- Core plugins: https://hexmora.github.io/fluxdown/guide/core/plugins.html

# Work

1. Inspect versions, render/renderInline calls, plugins, renderer.rules, env, and HTML consumers. Distinguish documents from inline rendering. Prefer a Fluxdown framework renderer for display-only integrations.
2. Create stable Core instances where needed, updating their input with complete Markdown. Choose HAST blocks, framework views, or HTML serialization based on downstream needs; Core is not a synchronous render function replacement.
3. Port plugins by responsibility: syntax, AST processing, or output. Check line breaks, HTML, autolinking, typography replacements, and custom nodes. Do not pass markdown-it plugins or Token objects directly to Core. Preserve useful env data and security constraints.
4. Handle block subscriptions and cleanup. Run project checks and verify static output, streaming appends, and custom rules with real content. Remove only dependencies confirmed unused.

# Deliver

Summarize changed entry points, validation, and behavior without an equivalent. Do not remove working features just to make the build pass.
```

</div>
</details>

## Replace the rendering boundary

The original document rendering might look like this:

```ts
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();
const html = md.render('# Hello');
```

Install Core, with a serializer if consumers still expect HTML:

```sh
pnpm add @fluxdown/core @fluxdown/types stative hast-util-to-html
pnpm add -D @types/hast
```

Create `BlocksRenderer`, `text`, and `core` from the [quick start](../quick-start.md), then read each block's current value:

```ts
import { toHtml } from 'hast-util-to-html';

const readHtml = () =>
  core.value.value.map((block) => toHtml(block.value.value)).join('');

text.next('# Hello\n\nUpdated content');
const html = readHtml();
```

This reads a snapshot. A live view must subscribe to both the list and block contents; see [state and updates](../streaming.md). Core has no direct `renderInline` equivalent. Places that accept only inline content need their own adapter; simply stripping `<p>` tags is not sufficient.

## Review the existing options

| markdown-it usage                          | Migration                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `md.use(plugin)`, syntax rules             | Check [remark](../plugins/remark.mdx) presets and rewrite custom syntax against the new contract. |
| `renderer.rules`                           | Handle HAST nodes in your renderer or [rehype](../plugins/rehype.mdx).                            |
| `env`                                      | Keep it as application context and pass it to custom processing that needs it.                    |
| `html`, `breaks`, `linkify`, `typographer` | Compare existing samples individually; these options have no same-name passthrough.               |

The quick start sets `build.indentedCode` and `build.setextHeading` to `false`. Explicitly enable them for static articles that need them. Turn off `build.repairEnding` after receiving final text. See [configuration](../configuration.md) for the complete fields.

Core processes and filters embedded HTML, while markdown-it disables HTML by default. Preserve an existing no-HTML policy explicitly; where HTML is allowed, check tags, attributes, and links. The two sets of defaults do not guarantee identical output.

## Finish up

Verify existing content, plugin behavior, and cleanup before removing markdown-it. When content is no longer needed, unsubscribe from external subscriptions and release Core and its input:

```ts
core.destroy();
text.destroy();
```

If markdown-it also powers a static-site build or editor, keep those uses and migrate only the intended runtime entry points.
