# markdown-to-jsx

Ordinary Markdown can go straight to Fluxdown when migrating from [markdown-to-jsx](https://github.com/quantizor/markdown-to-jsx). If your content embeds custom React tags, first decide how those components will be rendered.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Give this prompt to an agent with access to your project:

```markdown
# Goal

Migrate this React project's markdown-to-jsx usage to fluxdown, preserving content and application components.

# References

- Fluxdown: https://hexmora.github.io/fluxdown/guide/react/quick-start.html
- Configuration and extensions: https://hexmora.github.io/fluxdown/guide/react/configuration.html
- markdown-to-jsx: https://github.com/quantizor/markdown-to-jsx

# Steps

1. Confirm the installed version. Find default and /react imports, compiler calls, and wrappers. Inspect overrides, renderRule, wrapper, streaming options, and embedded content.
2. Install fluxdown and pass Markdown strings through text. Keep data sources and application layout intact. Drive streaming from the real request state.
3. Move typography to theme and standard element overrides to Slot plugins. Choose Render, Remark, Rehype plugins, or patches by purpose; do not reuse old AST types or rule callbacks directly.
4. Do not assume custom tags or JSX expressions are compatible. Choose an explicit integration for each application component in use, preserving its props, interactions, and content boundaries. Remove only unused dependencies.

# Acceptance

Run existing type checks, tests, and builds. Compare real documents for container layout, heading links, code blocks, raw HTML, custom components, and stream completion. Implement the migration and report verified behavior and remaining differences; do not remove content to avoid adapting it.
```

</div>
</details>

## Replace the component

```sh
pnpm add fluxdown
```

Before:

```tsx
import Markdown from 'markdown-to-jsx/react';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Markdown>{text}</Markdown>;
}
```

> Older projects may import from `markdown-to-jsx`. The replacement is the same.

After:

```tsx
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Fluxdown text={text} />;
}
```

In Next.js App Router, put Fluxdown in a wrapper file starting with `'use client';`. Keep data fetching in the server page, and define plugin classes and callbacks on the client side instead of passing them through server props.

Fluxdown renders its own container and has no matching `wrapper`, `forceWrapper`, or `forceInline` options. Keep an application wrapper for article semantics and layout. Avoid placing a block Markdown renderer inside paragraphs or other inline containers.

## Adapt overrides and styles

| Existing usage                                        | Migration                                                                                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options.overrides` for heading size or colors        | Use `theme.tokens`.                                                                                                                                         |
| `options.overrides` for links, images, or code blocks | Use [Slot plugins](../plugins/slot.md) and adapt to the corresponding slot props.                                                                           |
| `options.renderRule` or `createElement`               | Choose a [Render plugin](../plugins/render.md), an AST transform, or text `patches` based on the behavior. Old node types and callbacks are not compatible. |
| `options.wrapper`, outer `className`                  | Keep your outer container and use Fluxdown's `className` or `style` for layout.                                                                             |

For example, set the first-level heading and body font sizes:

```tsx
<Fluxdown
  text={text}
  theme={{
    tokens: {
      heading: { h1: { fontSize: '2rem' } },
      typography: { fontSize: { md: '1rem' } },
    },
  }}
/>
```

Base styles load with the component. If necessary, import `fluxdown/styles.css` in the application entry. Check existing heading IDs, table-of-contents anchors, line breaks, and HTML parsing with real articles. Enable footnotes, indented code, and Setext headings through [`build`](../configuration.md#build) when needed.

## Handle embedded application components

Combining `overrides: { ProductCard }` with `<ProductCard />` in Markdown does not automatically map to a Fluxdown slot. Fluxdown does not evaluate JSX expressions inside strings.

If a component already comes from structured data, keep rendering it outside the Markdown. For small substitutions inside text, use [`patches`](../configuration.md#patches). For custom syntax, parse it with a plugin and render it through your own Render / Slot plugins. Configure any required HTML tags and attributes through the allowlists described in [Rehype plugins](../../core/plugins/rehype.mdx).

## Connect streaming content

Replace `optimizeForStreaming` with accumulated text and the request state:

```tsx
<Fluxdown streaming={pending} text={text} />
```

Incomplete syntax behaves differently: Fluxdown attempts to repair the ending and reveal content smoothly instead of waiting for syntax to close. Set `pending` to `false` when the request finishes or stops. See [Streaming content](../streaming.md) to adjust the effects.

Remove `markdown-to-jsx` after all custom components and Markdown entry points have been migrated.
