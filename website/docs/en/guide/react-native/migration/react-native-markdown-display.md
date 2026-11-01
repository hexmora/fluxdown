# react-native-markdown-display

Move the Markdown string from `Markdown` children to Fluxdown's `text` prop. Keep the surrounding scroll container and message list; migrate styles and custom rules separately.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to an agent with access to your project:

```markdown
# Goal

Migrate react-native-markdown-display to @fluxdown/react-native in this project. Make the code changes while preserving content, layout, and interactions.

# References

- Source: https://github.com/iamacup/react-native-markdown-display
- Fluxdown: https://hexmora.github.io/fluxdown/guide/react-native/quick-start.html
- Custom components: https://hexmora.github.io/fluxdown/guide/react-native/plugins/slot.html

# Approach

1. Inspect dependency versions, Markdown usages, style, rules, markdownit, and link/image handling. Check the target's React Native and SVG requirements first.
2. Pass the Markdown string to text. Keep request and list state; for streams, pass the accumulated text and drive streaming from request status.
3. Move content styles to theme.tokens and keep container layout in style. Adapt rules and events through Slot or parsing plugins instead of copying markdown-it token callbacks.
4. Preserve navigation, image URL restrictions, and business validation. Find a verifiable replacement for incompatible features rather than silently removing them.

# Acceptance

Run existing checks. Verify long text, code, tables, links, images, and stream completion on supported mobile platforms. Remove dependencies only when unused. Report changes, verification results, and any differences that still need manual testing.
```

</div>
</details>

## Replace the component

Check that the app uses React 19 and React Native 0.83 or later, then install:

```sh
pnpm add @fluxdown/react-native react-native-svg
```

Use `react-native-svg` 15.16 or later. See [Quick start](../quick-start.md) for Expo installation and native iOS setup.

Before:

```tsx
import Markdown from 'react-native-markdown-display';

<Markdown style={{ body: { color: '#334155', fontSize: 16 } }}>
  {text}
</Markdown>;
```

After:

```tsx
import { Fluxdown } from '@fluxdown/react-native';

<Fluxdown
  text={text}
  theme={{
    tokens: {
      colors: { fg: '#334155' },
      typography: { fontSize: { md: 16 } },
    },
  }}
/>;
```

Fluxdown's `style` applies to the outer `View`; it does not accept rules such as `body` or `heading1`. Move fonts, colors, and paragraph spacing to [`theme.tokens`](../customization.md).

## Move rules and interactions

The [source library's](https://github.com/iamacup/react-native-markdown-display) `rules` receive markdown-it nodes. Fluxdown slots receive component props prepared for rendering. Links, images, and code blocks usually map to the `Link`, `Image`, and `CodeBlock` [Slot plugins](../plugins/slot.md). Adapt custom `markdownit` extensions through Core plugins; they cannot be passed directly to `plugins`.

Default links open through React Native's `Linking`. If you intercepted navigation with `onLinkPress`, or restricted image URLs with `allowedImageHandlers`, preserve that behavior in the corresponding slots.

For an existing streaming message, add the request status:

```tsx
<Fluxdown text={text} streaming={isStreaming} />
```

Pass the accumulated text and set `isStreaming` to `false` when complete. Verify the existing screens before removing the unused library and rule code.
