# Lynx Markdown

This guide covers Lynx's official [`<markdown>` native element](https://github.com/lynx-family/lynx-website/blob/main/docs/en/api/elements/built-in/markdown.mdx). For basic rendering, replace `content` with `text`. Styles, events, and native selection features need separate adapters.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to an agent with access to your project:

```markdown
# Goal

Migrate rendering from Lynx's official Markdown element to @fluxdown/lynx. Make the code changes and preserve existing app behavior.

# References

- Source element: https://github.com/lynx-family/lynx-website/blob/main/docs/en/api/elements/built-in/markdown.mdx
- Official examples: https://github.com/lynx-family/lynx-examples/tree/main/examples/markdown
- Fluxdown: https://hexmora.github.io/fluxdown/guide/lynx/quick-start.html
- Styles and interactions: https://hexmora.github.io/fluxdown/guide/lynx/customization.html

# Approach

1. Check Lynx/ReactLynx versions, native element registration, Markdown usages, and host bridges, including any markdown or x-markdown wrappers.
2. Map content to text and preserve data fetching and outer scrolling containers. Pass accumulated text and control streaming with request state; do not reuse native typewriter options directly.
3. Move markdown-style settings to theme.tokens and connect links, images, and code copying through slot plugins. Check inlineview content, custom syntax, selection, truncation, and native method calls.
4. Adapt features without a direct equivalent or retain the original element and explain the difference. Remove native registrations, type declarations, and dependencies only after confirming they have no remaining users.

# Validation

Run existing checks and target platform builds. Use real messages to verify static and streaming content, themes, navigation, scrolling, and native interactions. Summarize changes, results, and differences that still need manual verification.
```

</div>
</details>

## Replace the element

Install in an existing ReactLynx project:

```sh
pnpm add @fluxdown/lynx
```

Before, using the project's existing `<markdown>` type declarations and native registration:

```tsx
type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <markdown content={text} />;
}
```

After:

```tsx
import { Fluxdown } from '@fluxdown/lynx';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Fluxdown text={text} />;
}
```

Fluxdown renders with Lynx elements such as `view` and `text`. Your project's `@lynx-js/react-rsbuild-plugin` compiles the package's JSX, and importing the component loads its styles. Keep the outer `scroll-view` or message list; see [quick start](../quick-start.md).

## Adjust styles and streaming

Replace `markdown-style` with [`theme.tokens`](../customization.md) for content styles. Keep outer dimensions and spacing in `style`:

```tsx
<Fluxdown
  text={text}
  streaming={pending && { smooth: true, effect: 'suffix' }}
  style={{ padding: '16px' }}
  theme={['light', { tokens: { typography: { fontSize: { md: '16px' } } } }]}
/>
```

For example, move `markdown-style.normalText.fontSize` to the body font size setting; Fluxdown sizes use strings with units. Adjust headings, code, and paragraph spacing in the corresponding theme groups.

Always pass accumulated text. Set `pending` to `false` when the request completes, is cancelled, or fails. Its boolean direction is the opposite of `content-complete`. Do not pass through `animation-type`, `animation-velocity`, or `markdown-effect`; see [streaming content](../streaming.md) for smooth output and trailing effects.

## Reconnect interactions and custom content

Connect the original events through [slot plugins](../plugins/slot.md), calling your app's existing bridge methods:

| Previous feature        | Fluxdown integration                      |
| ----------------------- | ----------------------------------------- |
| `bindlink`              | `Link` slot's `onTap({ href })`.          |
| `bindimageTap`          | `Image` slot's `onTap({ src })`.          |
| Code copying            | `CodeBlock` slot's `onCopy({ code })`.    |
| `inlineview://` content | `patches` or a custom slot/render plugin. |

Fluxdown does not resolve `inlineview://` to child views automatically. Migrate that content explicitly, and check custom `<span>`/`<p>` styles and image size extensions against real content.

There are no matching top-level props for `text-selection`, `text-maxline`, selection menus, or native methods such as `getSelectedText`. Adapt those features or retain the original element where needed. `FluxdownRef` exposes rendering results, not a native element reference. Remove Markdown-specific host registrations and dependencies only when no pages still use them.
