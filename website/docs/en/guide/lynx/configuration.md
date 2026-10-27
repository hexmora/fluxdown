# Configuration

Basic usage follows [React](../react/configuration.md). The table links to the full reference for each prop; platform-specific `style` usage is covered below.

| Prop                                               | Type                           | Default and purpose                                                                    |
| -------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | Required. The complete current Markdown.                                               |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`. Ending repair, smoothing, and effects.                                        |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`. Parsing features such as math and footnotes.                                     |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`. A preset or partial overrides; see the [styling guide](./customization.md). |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`. Extends this platform’s preset; required for Raw.                                |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<ReactNode>[]`      | `[]`. Inserts or replaces text with ReactLynx content.                                 |
| [`className`](../react/configuration.md#classname) | `string`                       | `undefined`. Class name on the outer `view`.                                           |
| [`style`](../react/configuration.md#style)         | `CSSProperties`                | `undefined`. Lynx styles on the outer `view`.                                          |
| [`ref`](../react/configuration.md#ref)             | `Ref<FluxdownRef>`             | `undefined`. A handle to reactive render output, not a native view reference.          |

<details>
<summary>Imports</summary>

Import `BaseBuildConfig`, `StreamingConfig` and `FluxdownRef` from `@fluxdown/lynx`; `Theme` and `IPluginItem` from `@fluxdown/lynx-plugins/typings`; `CSSProperties` from `@lynx-js/types`; and `ReactNode` from `@lynx-js/react`.

</details>

## style <span className="field-tag">Optional</span> {#style}

**Type:** `CSSProperties`

**Default:** `undefined`

A Lynx style object on the outer `view`. Properties and values follow Lynx CSS. Use `className` to apply styles from your app:

```tsx
<Fluxdown
  className="conversation-message"
  style={{ padding: '16px', maxWidth: '720px' }}
  text={text}
/>
```

See the [styling guide](./customization.md) for colors and typography within the content, and [slot plugins](./plugins/slot.md) to change components or interactions.
