# Configuration

Basic usage follows [React](../react/configuration.md). The table links to the full reference for each prop; Taro's `style` usage is covered below.

| Prop                                               | Type                           | Default and purpose                                                                    |
| -------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | Required. The complete current Markdown.                                               |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`. Ending repair, smoothing, and effects.                                        |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`. Parsing features such as math and footnotes.                                     |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`. A preset or partial overrides; see the [styling guide](./customization.md). |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`. Extends the [Taro preset](./plugins/matrix.mdx); required for Raw.               |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<ReactNode>[]`      | `[]`. Inserts or replaces text with Taro components.                                   |
| [`className`](../react/configuration.md#classname) | `string`                       | `undefined`. Additional class name on the outer `View`.                                |
| [`style`](../react/configuration.md#style)         | `string \| CSSProperties`      | `undefined`. An object or style string for the outer `View`.                           |
| [`ref`](../react/configuration.md#ref)             | `Ref<FluxdownRef>`             | `undefined`. A handle to reactive render output, not a view reference.                 |

<details>
<summary>Imports</summary>

Import `BaseBuildConfig`, `StreamingConfig`, `Theme`, and `FluxdownRef` from `@fluxdown/taro`; `IPluginItem` from `@fluxdown/react-base-plugins/typings`; `IPatchItem` from `@fluxdown/core`; and `CSSProperties`, `ReactNode`, and `Ref` from `react`.

</details>

## style <span className="field-tag">Optional</span> {#style}

**Type:** `string | CSSProperties`

**Default:** `undefined`

Styles for the outer Taro `View`. Accepts an object or a CSS declaration string, following Taro's `style` prop. Use `className` to apply styles from your app:

```tsx
<Fluxdown
  className="conversation-message"
  style={{ padding: '16px', maxWidth: '720px' }}
  text={text}
/>
```

The same styles can be passed as a string:

```tsx
<Fluxdown style="padding: 16px; max-width: 720px" text={text} />
```

Use the [styling guide](./customization.md) for colors and typography within the content.

## Components and plugins

To change components or interactions, return Taro components from [slot plugins](./plugins/slot.md) or a [patch's `render` function](../react/configuration.md#patchesrender).

Full and Lite include different Taro plugins; see the [plugin matrix](./plugins/matrix.mdx). Full uses Prism for code highlighting. For formulas, it tries KaTeX through Taro `RichText`, then falls back to MathJax SVG through Taro `Image`, and finally to the source if rendering fails. Presentation follows the target platform's support for rich text and SVG images.
