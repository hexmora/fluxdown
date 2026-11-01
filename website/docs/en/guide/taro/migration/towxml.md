# Towxml

In a Taro React app, replace Towxml's parse-then-render flow with a component that accepts Markdown directly. This guide covers Markdown display. Keep or adapt any separate use of Towxml for HTML.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to an agent with access to your project:

```markdown
# Goal

Migrate Markdown display from Towxml to @fluxdown/taro in this Taro React project. Make the code changes while preserving content and business interactions.

# References

- Towxml: https://github.com/sbfkcel/towxml/wiki
- Fluxdown: https://hexmora.github.io/fluxdown/guide/taro/quick-start.html
- Custom components: https://hexmora.github.io/fluxdown/guide/taro/plugins/slot.html

# Approach

1. Check Taro and React versions. Locate parsing calls, usingComponents, styles, events, and resource URL configuration. Distinguish Markdown, HTML, and specialized chart usages.
2. Install compatible @fluxdown/taro dependencies and apply documented global styles and build configuration. Replace node input with the original Markdown in text. Keep fetching logic; streams use accumulated text and streaming.
3. Enable build.tex for math. Move themes to theme and navigation or image preview events to Slot plugins. Preserve relative resource resolution. Do not assume HTML, ECharts, or yUML has a direct equivalent.
4. Adapt incompatible features or retain their existing rendering path. Remove Towxml files, component registrations, and build-copy settings only after every usage has migrated.

# Acceptance

Run existing checks and build the mini-program and H5 targets the app uses. Verify text, code, math, image previews, links, and stream completion. Report completed changes, compatibility differences, and untested platforms.
```

</div>
</details>

## Install and replace

Fluxdown's Taro package is for Taro React. Check the version requirements and H5 build settings in [Quick start](../quick-start.md), then install:

```sh
pnpm add @fluxdown/taro @tarojs/components-react@4.3.1
```

Keep the app's `@tarojs/*` packages on the same version. Import the stylesheet in the global entry:

```ts
import '@fluxdown/taro/styles.css';
```

[Towxml 3](https://github.com/sbfkcel/towxml/wiki/3.0-%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8) parses content into nodes for a registered native mini-program component. Existing Taro code often looks like this, with an import path specific to the project:

```jsx
import towxml from '../../towxml';

export function Article({ text }) {
  const nodes = towxml(text, 'markdown', { theme: 'dark' });

  return <towxml nodes={nodes} />;
}
```

After migration, pass the original text:

```tsx
import { Fluxdown } from '@fluxdown/taro';

type ArticleProps = {
  text: string;
  pending: boolean;
};

export function Article({ text, pending }: ArticleProps) {
  return <Fluxdown text={text} streaming={pending} theme="dark" />;
}
```

Omit `streaming` for static articles. For streamed messages, pass all text received so far and set `pending` to `false` when complete. There is no Towxml node tree to update manually.

## Reconnect styles and interactions

Use `theme="light"` or `theme="dark"` for the built-in themes. Replace Towxml-specific CSS classes with [`theme.tokens`](../customization.md) or your own slot components.

Towxml's `events` do not map directly to Fluxdown props. Move navigation and image previews to the `Link` and `Image` [Slot plugins](../plugins/slot.md), preserving mini-program routing and resource restrictions. If the app used Towxml's `base`, keep resolving relative link and image URLs in the data layer or a plugin.

Enable parsing when the article contains math:

```tsx
<Fluxdown text={text} build={{ tex: true }} />
```

Check math and diagrams against real content. Towxml's ECharts and yUML configuration does not become Fluxdown plugins automatically; complete HTML pages also need separate handling. Taro math output depends on the target's rich text and SVG support; see [Configuration](../configuration.md).

Once every page has migrated, remove the corresponding `usingComponents.towxml` registrations, copied Towxml files, and related build settings.
