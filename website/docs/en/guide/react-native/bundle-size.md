# Reduce bundle size

React Native follows the same Full, Lite, and Raw entry points as React. Pick the preset that matches your app, then add individual plugins when needed. All three use native components, the same streaming pipeline, and the same theme and style props.

## Lite: code and formula source

Import `FluxdownLite` from `@fluxdown/react-native/lite`. Lite includes the native Markdown components, patches, and all four streaming effects. Code blocks show their source without syntax colors. With `build={{ tex: true }}`, formulas show their LaTeX source.

```tsx
import { FluxdownLite } from '@fluxdown/react-native/lite';

export function Message({ text }: { text: string }) {
  return <FluxdownLite build={{ tex: true }} text={text} />;
}
```

This entry does not load Shiki, MathJax, or the SVG formula renderer. Lite does not need `react-native-svg` unless you add a formula plugin that uses it.

Lite uses `PRESET_LIGHT_PLUGINS` from `@fluxdown/react-native-presets/lite`. Each pack can also be imported from `@fluxdown/react-native-presets/plugins/<directory>`.

| Plugin pack          | Directory       | Behavior                                                   |
| -------------------- | --------------- | ---------------------------------------------------------- |
| `PatchPlugin`        | `patch`         | Replace source ranges with native content.                 |
| `EffectShadPlugin`   | `effect-shad`   | Fade the trailing text.                                    |
| `EffectScalePlugin`  | `effect-scale`  | Animate newly visible characters.                          |
| `EffectChunkPlugin`  | `effect-chunk`  | Fade in new groups of text.                                |
| `EffectSuffixPlugin` | `effect-suffix` | Follow the visible content with a cursor or dot.           |
| `CodePlugin`         | `code`          | Show the code container, header, and plain source.         |
| `EmphasisPlugin`     | `emphasis`      | Render italic text.                                        |
| `ImagePlugin`        | `image`         | Render images and validate their URLs.                     |
| `LinkPlugin`         | `link`          | Render links and validate their URLs.                      |
| `ListPlugin`         | `list`          | Render ordered, unordered, and task lists.                 |
| `ParagraphPlugin`    | `paragraph`     | Render paragraphs.                                         |
| `StrongPlugin`       | `strong`        | Render bold text.                                          |
| `TablePlugin`        | `table`         | Render tables and aligned cells.                           |
| `TexPlugin`          | `tex`           | Show LaTeX source.                                         |
| `HeadingPlugin`      | `heading`       | Render headings from level one to six.                     |
| `BreakLinePlugin`    | `break-line`    | Render line breaks.                                        |
| `BlockquotePlugin`   | `blockquote`    | Render blockquotes.                                        |
| `FallbackPlugin`     | `fallback`      | Render plain text, inline code, and remaining basic nodes. |

## Full: highlighting and typesetting

Import `Fluxdown` from `@fluxdown/react-native`, or explicitly from `@fluxdown/react-native/full`. Full replaces Lite's code and formula plugins with `CodeShikiPlugin` and `TexMathjaxPlugin`. Code uses Shiki; formulas load MathJax on demand and render with native SVG. Formula source stays readable while conversion loads or fails.

```tsx
import { Fluxdown } from '@fluxdown/react-native/full';

export function Message({ text }: { text: string }) {
  return <Fluxdown build={{ tex: true }} text={text} />;
}
```

Full uses `PRESET_FULL_PLUGINS` from `@fluxdown/react-native-presets/full`. Install `react-native-svg` as described in [Quick start](./quick-start.md). React's Full preset uses a different formula backend; the native preset does not introduce a WebView or DOM renderer.

## Add capabilities to Lite

Install `@fluxdown/react-native-presets` and import only the plugin packs you need:

```tsx
import { FluxdownLite } from '@fluxdown/react-native/lite';
import { CodeShikiPlugin } from '@fluxdown/react-native-presets/plugins/code-shiki';

const plugins = [CodeShikiPlugin];

export function Message({ text }: { text: string }) {
  return <FluxdownLite plugins={plugins} text={text} />;
}
```

Use `TexMathjaxPlugin` from `@fluxdown/react-native-presets/plugins/tex-mathjax` to add SVG formula rendering, and install `react-native-svg`. Supplied plugins take precedence over each preset. Replacing a Full plugin does not remove the heavy dependencies Full already imports.

## Raw: choose every plugin

`FluxdownRaw` has a required `plugins` prop. It supplies the native root, theme, and basic node slot, while you choose the render and component plugins:

```tsx
import { FluxdownRaw } from '@fluxdown/react-native/raw';
import { FallbackPlugin } from '@fluxdown/react-native-presets/plugins/fallback';
import { ParagraphPlugin } from '@fluxdown/react-native-presets/plugins/paragraph';

const plugins = [FallbackPlugin, ParagraphPlugin];

export function Message({ text }: { text: string }) {
  return <FluxdownRaw plugins={plugins} text={text} />;
}
```

Include the plugins for the Markdown syntax and effects your app enables. Use `plugins={PRESET_LIGHT_PLUGINS}` when you want the complete Lite baseline with an explicitly selected preset. See [Using and writing plugins](./plugins.md) for custom packs and slots.
