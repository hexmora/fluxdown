# solid-markdown

Move `SolidMarkdown`'s `children` to Fluxdown's `text` and keep existing signals and request logic. The target component requires Solid 1.9 or a later 1.x release.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to the agent working in your project:

```markdown
Migrate the project from solid-markdown to @fluxdown/solid. Implement the changes.

# References

- Source: https://github.com/andi23rosca/solid-markdown
- Target: https://hexmora.github.io/fluxdown/guide/solid/quick-start.html

# Steps

1. Check dependency versions and SolidMarkdown usages, including components, remarkPlugins, rehypePlugins, HTML, and styles.
2. Replace it with Fluxdown and move children to text. Preserve Solid's reactive reads; do not destructure props early or save signal values in plain variables.
3. Use the target docs to move component overrides to Slot plugins and adapt extra unified plugins through Remark/Rehype plugins. Prefer built-in syntax and highlighting, and check allowed HTML.
4. For streams, pass accumulated text and derive streaming from the request state. Preserve navigation and interactions.
5. Run existing checks and verify reactive updates, actual Markdown, custom components, and SSR styles. Remove only dependencies with no other uses.

Report changes and verification results, and identify remaining differences without silently dropping features.
```

</div>
</details>

## Replace the component

```sh
pnpm add @fluxdown/solid
```

Before:

```tsx
import { SolidMarkdown } from 'solid-markdown';

type ArticleProps = { text: string };

export function Article(props: ArticleProps) {
  return <SolidMarkdown children={props.text} />;
}
```

After:

```tsx
import { Fluxdown } from '@fluxdown/solid';

type ArticleProps = { text: string };

export function Article(props: ArticleProps) {
  return <Fluxdown text={props.text} />;
}
```

Read `props.text` directly in JSX, or use `text={text()}` for a signal. The browser entry loads styles; for SSR, import `@fluxdown/solid/styles.css` at the application entry.

## Move extensions and styles

Fluxdown includes tables, task lists, strikethrough, and ordinary line breaks. The full preset also includes code highlighting. Remove duplicate configuration for these features, then compare real articles. Enable parsing for math and footnotes:

```tsx
<Fluxdown text={props.text} build={{ tex: true, footnote: true }} />
```

Move `components` to [Slot plugins](../plugins/slot.md): use `Link` for links and `CodeBlock` for fenced code. Adapt props to the target slot's types and preserve reactive reads inside the slot component.

Retain additional `remarkPlugins` and `rehypePlugins` through the [Remark](../../core/plugins/remark.mdx) and [Rehype](../../core/plugins/rehype.mdx) base classes. Their old arrays cannot be passed directly to `plugins`. Review HTML rules and node filtering in the new pipeline as well.

Keep layout containers and use [theme configuration](../customization.md) for text, fonts, and code colors. See the [solid-markdown README](https://github.com/andi23rosca/solid-markdown) for the source API.

## Connect streaming content

```tsx
import { Fluxdown } from '@fluxdown/solid';

type MessageProps = { text: string; pending: boolean };

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} streaming={props.pending} />;
}
```

Pass the complete accumulated content as `text` and set `pending` to `false` when the request finishes.
