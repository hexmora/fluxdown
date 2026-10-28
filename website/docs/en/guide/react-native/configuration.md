# Configuration

Basic usage follows [React](../react/configuration.md). The table links to the full reference for each prop; platform-specific `style` usage is covered below.

| Prop                                               | Type                           | Default and purpose                                                                    |
| -------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | Required. The complete current Markdown.                                               |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`. Ending repair, smoothing, and effects.                                        |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`. Parsing features such as math and footnotes.                                     |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`. A preset or partial overrides; see the [styling guide](./customization.md). |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`. Extends this platform’s preset; required for Raw.                                |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<ReactNode>[]`      | `[]`. Inserts or replaces text with native components.                                 |
| [`style`](../react/configuration.md#style)         | `StyleProp<ViewStyle>`         | `undefined`. Styles for the outer `View`, including arrays.                            |
| [`ref`](../react/configuration.md#ref)             | `Ref<FluxdownRef>`             | `undefined`. A handle to reactive render output, not a native view reference.          |

<details>
<summary>Imports</summary>

Import `BaseBuildConfig`, `StreamingConfig`, and `FluxdownRef` from `@fluxdown/react-native`, `Theme` from `@fluxdown/react-native-plugins/typings`, and `IPluginItem` from `@fluxdown/react-base-plugins/typings`.

</details>

## style <span className="field-tag">Optional</span> {#style}

**Type:** `StyleProp<ViewStyle>`

**Default:** `undefined`

React Native styles on the outer `View`. Accepts an object, a `StyleSheet.create` result, or a style array. There is no `className` prop; use `style` for container layout:

```tsx
<Fluxdown style={{ padding: 16, maxWidth: 720 }} text={text} />
```

See the [styling guide](./customization.md) for colors and typography within the content, and [slot plugins](./plugins/slot.md) to change components or interactions.
