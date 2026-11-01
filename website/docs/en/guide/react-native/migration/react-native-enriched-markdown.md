# react-native-enriched-markdown

This guide migrates Markdown display through `EnrichedMarkdownText`. Fluxdown renders content; it does not replace a rich text input. Keep `EnrichedMarkdownTextInput` wherever the app still needs it.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to an agent with access to your project:

```markdown
# Goal

Migrate Markdown display from react-native-enriched-markdown to @fluxdown/react-native. Update code and dependencies while preserving business behavior.

# References

- Source: https://github.com/software-mansion/enriched-markdown
- Fluxdown: https://hexmora.github.io/fluxdown/guide/react-native/quick-start.html
- Themes and interactions: https://hexmora.github.io/fluxdown/guide/react-native/customization.html

# Approach

1. Inspect the installed version, display components, streaming wrappers, styles, and event callbacks. Check target React Native and SVG requirements. Separate display from input and retain editors still in use.
2. Map markdown to text, content styles to theme.tokens, and layout to style. Keep fetching and message state; use accumulated text and streaming for streamed output.
3. Reconnect navigation, image actions, and code toolbars through Slot plugins. Check task lists, syntax extensions, text selection, and copy menus for equivalent behavior; native capabilities are not inherited automatically.
4. Adapt incompatible features or keep their existing components, documenting any differences. Remove only unused packages, native configuration, and streaming wrappers.

# Acceptance

Run existing checks and target-platform builds. Verify static and streaming content, themes, navigation, and native interactions. Summarize completed changes, results, and anything needing manual verification.
```

</div>
</details>

## Replace the display component

Use React 19, React Native 0.83 or later, and `react-native-svg` 15.16 or later:

```sh
pnpm add @fluxdown/react-native react-native-svg
```

See [Quick start](../quick-start.md) for Expo installation and native iOS setup.

Before:

```tsx
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';

<EnrichedMarkdownText markdown={text} flavor="github" />;
```

After:

```tsx
import { Fluxdown } from '@fluxdown/react-native';

<Fluxdown text={text} />;
```

Fluxdown includes GFM tables, strikethrough, and task lists by default; no `flavor` prop is needed. Displaying task state is separate from toggling it. Reconnect interactions explicitly if the screen writes task changes back to your data.

## Styles and streaming

Map `markdownStyle` to [`theme.tokens`](../customization.md) by purpose. Keep outer dimensions and padding in `style`:

```tsx
<Fluxdown
  text={text}
  streaming={isStreaming}
  style={{ padding: 16 }}
  theme={['dark', { tokens: { typography: { fontSize: { md: 16 } } } }]}
/>
```

Pass the accumulated text and set `isStreaming` to `false` when complete. Do not copy `streamingAnimation` or wrapper options directly. See [Streaming content](../streaming.md) for pacing and end-of-stream effects.

## Preserve native interactions

The [source library](https://github.com/software-mansion/enriched-markdown) implements its own selection, copy menus, image menus, and editor. Replacing the display component does not carry those features over. Verify replacements before removing behavior the app relies on.

Use the `Link` and `Image` [Slot plugins](../plugins/slot.md) for navigation and image actions, and `CodeHeader` for copy or share controls. Fluxdown opens links through `Linking` by default, and its native code toolbar has no clipboard integration. Connect in-app routes and copying explicitly.

If `EnrichedMarkdownTextInput` remains in use, keep its dependency and native setup, and replace only the preview area.
